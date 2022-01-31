import express from 'express'
import got from 'got'
import { DateTime } from 'luxon'
import { uid } from 'quasar'
import { query } from './database.mjs'
import { hasRole } from './utils.mjs'
import mailchimp from '@mailchimp/mailchimp_marketing'

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
    console.log(err)
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
    console.log(err)
    return res.sendStatus(500)
  }
})

async function createMailchimp (email) {
  await mailchimp.lists.batchListMembers(process.env.MAILCHIMP_LIST_ID, {
    members: [{
      email_address: email,
      email_type: 'html'
    }],
    update_existing: true
  })
}

async function createVend (member) {
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
    console.log(err)
    console.log(err?.response?.body)
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
  const latestId = results[0].max || 'm1000'
  let id = parseInt(latestId.slice(1), 10)
  return `m${++id}`
}

async function createMember (joinDate, membershipId, member) {
  await createMailchimp(member.email)
  const memberId = await getNextMemberId()
  // Create the new member record
  const newMember = await query('INSERT into customers (id, postal, city, name, firstname, lastname, email, phone, curdate, visible, membership_id, vend_id) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *', [memberId, member.postcode, member.suburb, `${member.firstname} ${member.lastname}`, member.firstname, member.lastname, member.email, member.phone, joinDate.toString(), true, membershipId, member.vend_id])

  // add the extras
  await query('INSERT into members_extra (id, sendemails) values($1, $2) RETURNING *', [memberId, member.sendemails])
  // update the history
  await query('INSERT into members_history (id, datenew, member, action, amountpaid, notes) values($1, $2, $3, $4, $5, $6) RETURNING *', [uid(), joinDate.toString(), memberId, 'Registered', null, 'Entered into database'])

  return newMember
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
    const membership = await query('INSERT into memberships (membership_id, membership_type_id, concession, expires) VALUES ($1, $2, $3, $4) RETURNING *', [membershipId, signup[0].membership_type_id, signup[0].concession, joinDate.plus({ years: 1 })])
    // TODO for now, we'll simply log these events into the members_history with the membershipId instead of the memberId
    await query('INSERT into members_history (id, datenew, member, action, amountpaid, notes) values($1, $2, $3, $4, $5, $6) RETURNING *', [uid(), joinDate.toString(), membershipId, 'Applied', req.body.paid, '12 months'])

    // Create the members
    const membersToCreate = await query('SELECT * from signup_members WHERE signup_id = $1', [req.params.id])
    const members = await Promise.all(membersToCreate.map(member => createMember(joinDate, membershipId, member)))

    // delete the signup
    await deleteSignup(req.params.id)
    res.json({
      ...membership,
      members
    })
  } catch (err) {
    console.log(err)
    return res.sendStatus(500)
  }
})

export default router
