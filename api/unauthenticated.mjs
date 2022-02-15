import express from 'express'
import { encryptPassword, makeSalt, query } from './database.mjs'
import { getUserToken } from './auth.mjs'
import { emailRegex } from './utils.mjs'
import { sendPasswordReset } from './email.mjs'

/*
 * Any unauthenticated URLs needs to be listed inside server.mjs at the root of
 * this project
 */

const router = express.Router()

router.get('/membership-types', async (req, res) => {
  try {
    const results = await query('SELECT membership_type_id, label, max_members, price, concession, concession_caption from membership_types')
    res.send(results)
  } catch (err) {
    console.log(err)
    return res.sendStatus(500)
  }
})

const signupProps = ['firstname', 'lastname', 'suburb', 'postcode', 'email', 'phone', 'sendemails']

router.post('/signup', async (req, res) => {
  try {
    const membership = await query('INSERT into signup (membership_type_id, concession) values($1, $2) RETURNING *', [req.body.membership_type_id, req.body.concession])
    for (const member of req.body.members) {
      // TODO not very performant, ideally we should use some kind of bulk-insert
      await query(`INSERT into signup_members (signup_id, ${signupProps.join(', ')}) values($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [membership[0].id, ...signupProps.map(prop => member[prop])])
    }
    res.sendStatus(200)
  } catch (err) {
    console.error(err)
    res.status(500).send('Error ' + err)
  }
})

router.post('/invites/:id/accept', async (req, res) => {
  try {
    const invite = await query('SELECT * FROM invites WHERE token = $1', [req.params.id])
    if (!invite.length) return res.sendStatus(404)
    if (typeof req.body.name !== 'string' || !req.body.name.length) {
      return res.status(400).send({ error: 'Must provide a name' })
    }
    if (typeof req.body.password !== 'string' || req.body.password.length < 8) {
      return res.status(400).send({ error: 'Invalid password' })
    }
    const { key, salt } = await encryptPassword(req.body.password)
    const newUser = await query('INSERT INTO auth (name, email, role, password, salt) VALUES($1, $2, $3, $4, $5) RETURNING *', [req.body.name, invite[0].email, invite[0].role, key, salt])
    await query('DELETE FROM invites WHERE token = $1', [req.params.id])

    // log the user in immediately
    const token = getUserToken(newUser[0])
    return res.json({ token })
  } catch (err) {
    console.log(err)
    return res.sendStatus(500)
  }
})

router.post('/forgot/:token', async (req, res) => {
  try {
    // load the token
    const reset = await query('SELECT auth_id FROM password_reset WHERE NOW() < expiry and token = $1', [req.params.token])
    if (!reset.length) return res.sendStatus(404)
    if (typeof req.body.password !== 'string' || req.body.password.length < 8) {
      return res.status(400).send({ error: 'Invalid password' })
    }
    // encrypt the password
    const { key, salt } = await encryptPassword(req.body.password)
    // set the password
    await query('UPDATE auth SET password = $1, salt = $2 WHERE id = $3 RETURNING *', [key, salt, reset[0].auth_id])
    // remove all resets
    await query('DELETE FROM password_reset WHERE auth_id = $1', [reset[0].auth_id])
    res.sendStatus(200)
  } catch (err) {
    console.log(err)
    return res.sendStatus(500)
  }
})

router.post('/forgot', async (req, res) => {
  try {
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).send({ error: 'Invalid email' })
    }
    await sendPasswordReset(req.body.email, req.body.role)
    res.sendStatus(200)
  } catch (err) {
    console.log(err)
    if (/User not found/.test(err.message)) {
      return res.status(404).send({ error: err.message })
    }
    return res.sendStatus(500)
  }
})

export default router
