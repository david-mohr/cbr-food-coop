import express from 'express'
import got from 'got'
import { DateTime } from 'luxon'
import { uid } from 'quasar'
import { query } from './database.mjs'
import { hasRole } from './utils.mjs'

const router = express.Router()

const signupProps = ['firstname', 'lastname', 'suburb', 'postcode', 'email', 'phone', 'membership', 'concession', 'sendemails']

router.post('/signup', async (req, res) => {
  try {
    await query(`INSERT into signup (${signupProps.join(', ')}) values($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, signupProps.map(prop => req.body[prop]))
    res.sendStatus(200)
  } catch (err) {
    console.error(err)
    res.status(500).send('Error ' + err)
  }
})

router.get('/signups', hasRole('coordinator'), async (req, res) => {
  try {
    const results = await query('SELECT * from signup')
    res.send(results)
  } catch (err) {
    console.log(err)
    return res.sendStatus(500)
  }
})

const VEND_URL = 'https://thefoodcooperativeshop.vendhq.com/api/2.0'
router.post('/signups/:id/vend', hasRole('coordinator'), async (req, res) => {
  try {
    const results = await query('SELECT * from signup WHERE id = $1', [req.params.id])
    if (!Array.isArray(results) || !results.length) return res.sendStatus(404)
    if (results[0].vendid) return res.sendStatus(409)
    const json = {
      first_name: results[0].firstname,
      last_name: results[0].lastname,
      email: results[0].email,
      mobile: results[0].phone,
      physical_suburb: results[0].suburb,
      physical_postcode: results[0].postcode,
      physical_country_id: 'AU'
    }
    const newVendUser = await got.post(`${VEND_URL}/customers`, {
      headers: {
        authorization: `Bearer ${process.env.VEND_API_KEY}`
      },
      json
    }).json()
    console.log(newVendUser)
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

router.post('/signups/:id/member', hasRole('coordinator'), async (req, res) => {
  try {
    if (!Number.isFinite(req.body.paid)) {
      return res.status(400).send('Invalid paid (Must be a number)')
    }
    const results = await query('SELECT * from signup WHERE id = $1', [req.params.id])
    if (!Array.isArray(results) || !results.length) return res.sendStatus(404)
    if (!results[0].vendid) return res.status(409).send('Not in Vend')

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
