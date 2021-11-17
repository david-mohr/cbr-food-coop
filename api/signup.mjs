import express from 'express'
import got from 'got'
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

export default router
