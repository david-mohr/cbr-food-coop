import express from 'express'
import { query } from './database.mjs'

const router = express.Router()

const signupProps = ['firstname', 'lastname', 'address', 'postal', 'city', 'email', 'phone', 'anuaffiliation', 'incomelevel', 'sendemails']

router.post('/signup', async (req, res) => {
  try {
    await query(`INSERT into signup (${signupProps.join(', ')}) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`, signupProps.map(prop => req.body[prop]))
    res.sendStatus(200)
  } catch (err) {
    console.error(err)
    res.status(500).send('Error ' + err)
  }
})

export default router
