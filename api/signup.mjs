import express from 'express'
import { query } from './database.mjs'

const router = express.Router()

router.post('/signup', async (req, res) => {
  try {
    await query('INSERT into signup(name, phone, email) values($1, $2, $3) RETURNING *', [req.body.name, req.body.phone, req.body.email])
    res.sendStatus(200)
  } catch (err) {
    console.error(err)
    res.status(500).send('Error ' + err)
  }
})

export default router
