import express from 'express'
import got from 'got'
import { randomUUID } from 'crypto'
import { DateTime } from 'luxon'
import { query } from './database.mjs'
import { hasRole } from './utils.mjs'
import mailchimp from '@mailchimp/mailchimp_marketing'
import { formatDateForMailchimp, calculateDaysLeft, determineSignupTags } from './utils/mailchimp.mjs'

const router = express.Router()
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX
})

router.get('/', hasRole('coordinator'), async (req, res) => {
  try {
    const signups = await query('SELECT * from signup')
    for (const signup of signups) {
      const members = await query('SELECT * from signup_members WHERE signup_id = $1', [signup.id])
      signup.members = members
    }
    res.send(signups)
  } catch (err) {
    console.error(err)
    return res.sendStatus(500)
  }
})

async function deleteSignup (signupId) {
  await query('DELETE FROM signup_members WHERE signup_id = $1', [signupId])
  await query('DELETE FROM signup WHERE id = $1', [signupId])
}

router.delete('/:id', hasRole('coordinator'), async (req, res) => {
  try {
    await deleteSignup(req.params.id)
    res.sendStatus(204)
  } catch (err) {
    console.error(err)
    return res.sendStatus(500)
  }
})

async function createMailchimp (membership, member, joinDate) {
  const email = member.email.toLowerCase()

  // Determine tags for new signup
  const tags = determineSignupTags(member, membership)
  
  const memberDetails = {
    email_address: email,
    status: 'subscribed',
    merge_fields: {
      FNAME: member.firstname || '',
      LNAME: member.lastname || '',
      PHONE: member.phone || '',
      SUBURB: member.suburb || '',
      MTYPE: membership.membership_type_label || String(membership.membership_type_id || ''),
      CONCESSION: membership.concession || '',
      EXPIRY: formatDateForMailchimp(membership.expires || DateTime.now().plus({ years: 1 }).toJSDate()),
      DAYSLEFT: calculateDaysLeft(membership.expires || DateTime.now().plus({ years: 1 }).toJSDate()),
      JOINED: formatDateForMailchimp(joinDate.toJSDate())
      // DDAYSLEFT, DISCEXP, LASTVOL omitted — new members have no discount/volunteer history
    },
    tags: tags
  }

  try {
    const result = await mailchimp.lists.addListMember(
      process.env.MAILCHIMP_LIST_ID,
      memberDetails
    )
    return result
  } catch (error) {
    const body = error.response?.body
    const isMemberExists = error.status === 400 && body?.title === 'Member Exists'

    if (isMemberExists) {
      // Member already on the list — nothing to do for new signups
      console.warn('Mailchimp member already exists, skipping:', memberDetails.email_address)
      return
    }

    console.error('Failed to create Mailchimp member:', {
      email: memberDetails.email_address,
      status: error.status,
      title: body?.title,
      detail: body?.detail
      // memberDetails: memberDetails
    })
    throw error
  }
}

async function createVend (member) {
  if (process.env.NODE_ENV !== 'production') return { data: { id: 'not_a_real_vend_id' } }
  const json = {
    first_name: member.firstname,
    last_name: member.lastname,
    email: member.email,
    mobile: member.phone,
    physical_suburb: member.suburb,
    physical_postcode: member.postcode,
    physical_country_id: 'AU'
  }
  return got.post(`${VEND_URL}/customers`, {
    headers: {
      authorization: `Bearer ${process.env.VEND_API_KEY}`
    },
    json
  }).json()
}

const VEND_URL = 'https://thefoodcooperativeshop.vendhq.com/api/2.0'
router.post('/:id/vend', hasRole('coordinator'), async (req, res) => {
  try {
    const members = await query('SELECT * from signup_members WHERE signup_id = $1', [req.params.id])
    if (!Array.isArray(members) || !members.length) return res.sendStatus(404)
    const final = {}
    for (const member of members) {
      if (member.vend_id) {
        final[member.id] = member.vend_id
        continue
      }
      const newVendUser = await createVend(member)
      await query('UPDATE signup_members SET vend_id = $1 WHERE id = $2', [newVendUser.data.id, member.id])
      final[member.id] = newVendUser.data.id
    }
    res.json(final)
  } catch (err) {
    return res.sendStatus(500)
  }
})

export async function getNextMemberId () {
  const results = await query('SELECT MAX(id) from customers')
  const latestId = results[0].max || 'c1000'
  let id = parseInt(latestId.slice(1), 10)
  return `c${++id}`
}

export async function getNextMembershipId () {
  const results = await query('SELECT MAX(membership_id) from memberships')
  const latestId = results[0].max || 'm5000'
  let id = parseInt(latestId.slice(1), 10)
  return `m${++id}`
}

async function createMember (joinDate, membership, member) {
  // Only create in Mailchimp if sendemails is not explicitly false
  let mailchimpWarning = null
  if (member.sendemails !== false) {
    try {
      await createMailchimp(membership, member, joinDate)
    } catch (e) {
      console.error('Failed to sync new member to Mailchimp:', {
        email: member.email,
        status: e.status,
        error: e.message
      })
      // Note: Member will be picked up by next sync script run if Mailchimp sync fails here
      // Continue with member creation even if Mailchimp fails
      mailchimpWarning = `Mailchimp sync failed for ${member.email}: ${e.message}`
    }
  }

  const memberId = await getNextMemberId()

  // Create the new member record
  const newMember = await query(
    'INSERT into customers (id, postal, city, name, firstname, lastname, email, phone, curdate, visible, membership_id, vend_id) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
    [
      memberId, // $1 - customers.id
      member.postcode, // $2 - customers.postal
      member.suburb, // $3 - customers.city
      `${member.firstname} ${member.lastname}`, // $4 - customers.name
      member.firstname, // $5 - customers.firstname
      member.lastname, // $6 - customers.lastname
      member.email, // $7 - customers.email
      member.phone, // $8 - customers.phone
      joinDate.toString(), // $9 - customers.curdate
      true, // $10 - customers.visible
      membership.membership_id, // $11 - customers.membership_id
      member.vend_id // $12 - customers.vend_id
    ]
  )

  // Add the extras
  await query(
    'INSERT into members_extra (id, sendemails) values($1, $2) RETURNING *',
    [
      memberId, // $1 - members_extra.id
      member.sendemails !== false // $2 - members_extra.sendemails (default to true)
    ]
  )

  // Update the history
  await query(
    'INSERT into members_history (id, datenew, member, action, amountpaid, notes) values($1, $2, $3, $4, $5, $6) RETURNING *',
    [
      randomUUID(), // $1 - members_history.id
      joinDate.toString(), // $2 - members_history.datenew
      memberId, // $3 - members_history.member
      'Registered', // $4 - members_history.action
      null, // $5 - members_history.amountpaid
      'Entered into database' // $6 - members_history.notes
    ]
  )

  return { ...newMember[0], mailchimpWarning }
}

/**
 * This is now split into two parts:
 *  - create the membership
 *  - create the members (and link them to the membership)
 */
router.post('/:id/member', hasRole('coordinator'), async (req, res) => {
  try {
    if (!Number.isFinite(req.body.paid)) {
      return res.status(400).send('Invalid paid (Must be a number)')
    }
    const signup = await query('SELECT * from signup WHERE id = $1', [req.params.id])

    if (!Array.isArray(signup) || !signup.length) return res.sendStatus(404)

    // Create membership
    const joinDate = DateTime.now()
    const membershipId = await getNextMembershipId()
    const membershipTypes = await query('SELECT * FROM membership_types WHERE membership_type_id = $1', [signup[0].membership_type_id])
    const membershipTypeLabel = membershipTypes[0]?.label || String(signup[0].membership_type_id)
    const membership = await query(
      'INSERT into memberships (membership_id, membership_type_id, concession, expires) VALUES ($1, $2, $3, $4) RETURNING *',
      [
        membershipId, // $1 - memberships.membership_id
        signup[0].membership_type_id, // $2 - memberships.membership_type_id
        signup[0].concession, // $3 - memberships.concession
        joinDate.plus({ years: 1 }) // $4 - memberships.expires
      ]
    )

    // Log membership application to history (using membershipId instead of memberId)
    await query(
      'INSERT into members_history (id, datenew, member, action, amountpaid, notes) values($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        randomUUID(), // $1 - members_history.id
        joinDate.toString(), // $2 - members_history.datenew
        membershipId, // $3 - members_history.member (membershipId for membership-level events)
        'Applied', // $4 - members_history.action
        req.body.paid, // $5 - members_history.amountpaid
        '12 months' // $6 - members_history.notes
      ]
    )

    // Create the members
    const membersToCreate = await query('SELECT * from signup_members WHERE signup_id = $1', [req.params.id])
    const membershipWithLabel = { ...membership[0], membership_type_label: membershipTypeLabel }
    const members = await Promise.all(membersToCreate.map(member => createMember(joinDate, membershipWithLabel, member)))
      .catch(e => { return res.sendStatus(e.status) })

    // delete the signup
    await deleteSignup(req.params.id)
    const warnings = members.map(m => m.mailchimpWarning).filter(Boolean)
    res.json({
      ...membership[0],
      members,
      ...(warnings.length ? { warnings } : {})
    })
  } catch (err) {
    console.error(err)
    return res.sendStatus(500)
  }
})

export default router
