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

router.delete('/:id', hasRole('coordinator'), async (req, res) => {
  try {
    await query('DELETE FROM signup WHERE id = $1', [req.params.id])
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
    const results = await query('SELECT * from signup WHERE id = $1', [req.params.id])
    if (!Array.isArray(results) || !results.length) return res.sendStatus(404)
    if (results[0].vendid) return res.sendStatus(409)
    const newVendUser = await createVend(results[0])
    await query('UPDATE signup SET vendid = $1 WHERE id = $2', [newVendUser.data.id, req.params.id])
    res.json({ vendid: newVendUser.data.id })
  } catch (err) {
    console.log(err)
    console.log(err?.response?.body)
    return res.sendStatus(500)
  }
})

export async function getNextMemberId () {
  const results = await query('SELECT MAX(id) from customers')
  const latestId = results[0].max
  let id = parseInt(latestId.slice(1), 10)
  return `c${++id}`
}

router.post('/:id/member', hasRole('coordinator'), async (req, res) => {
  try {
    if (!Number.isFinite(req.body.paid)) {
      return res.status(400).send('Invalid paid (Must be a number)')
    }
    const results = await query('SELECT * from signup WHERE id = $1', [req.params.id])
    if (!Array.isArray(results) || !results.length) return res.sendStatus(404)
    if (!results[0].vendid) return res.status(409).send('Not in Vend')
    await createMailchimp(results[0].email)
    const joindate = DateTime.now()
    const id = await getNextMemberId()
    // Create the new member record
    const member = await query('INSERT into customers (id, postal, city, name, firstname, lastname, email, phone, curdate, visible) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *', [id, results[0].postcode, results[0].suburb, `${results[0].firstname} ${results[0].lastname}`, results[0].firstname, results[0].lastname, results[0].email, results[0].phone, joindate.toString(), true])

    // add the expiry
    await query('INSERT into members_extra (id, membershipexpires, sendemails) values($1, $2, $3) RETURNING *', [id, joindate.plus({ years: 1 }), results[0].sendemails])

    // update the history
    await query('INSERT into members_history (id, datenew, member, action, amountpaid, notes) values($1, $2, $3, $4, $5, $6) RETURNING *', [uid(), joindate.toString(), id, 'Applied', req.body.paid, '12 months'])
    await query('INSERT into members_history (id, datenew, member, action, amountpaid, notes) values($1, $2, $3, $4, $5, $6) RETURNING *', [uid(), joindate.toString(), id, 'Registered', null, 'Entered into database'])

    // delete the signup
    await query('DELETE FROM signup WHERE id = $1', [req.params.id])
    res.json({ member: member[0] })
  } catch (err) {
    console.log(err)
    console.log(err?.response?.body)
    return res.sendStatus(500)
  }
})

export default router
