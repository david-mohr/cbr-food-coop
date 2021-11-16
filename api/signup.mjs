import express from 'express'
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

export default router
