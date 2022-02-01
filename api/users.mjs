import express from 'express'
import { query } from './database.mjs'
import { sendInvite } from './email.mjs'
import { emailRegex, hasRole, roles } from './utils.mjs'

const router = express.Router()

router.get('/', hasRole('admin'), async (req, res) => {
  try {
    const results = await query('SELECT id, email, role, name from auth')
    res.send(results)
  } catch (err) {
    console.log(err)
    return res.sendStatus(500)
  }
})

router.post('/', hasRole('admin'), async (req, res) => {
  try {
    if (!roles.includes(req.body.role)) {
      return res.status(400).send({ error: 'Invalid role' })
    }
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).send({ error: 'Invalid email' })
    }
    await sendInvite(req.body.email, req.body.role)
    res.sendStatus(200)
  } catch (err) {
    console.log(err)
    return res.sendStatus(500)
  }
})

export default router
