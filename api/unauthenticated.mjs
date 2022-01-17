import express from 'express'
import { encryptPassword, query } from './database.mjs'
import { getUserToken } from './auth.mjs'

/*
 * Any unauthenticated URLs needs to be listed inside server.mjs at the root of
 * this project
 */

const router = express.Router()

router.get('/membership-types', async (req, res) => {
  try {
    const results = await query('SELECT membership_type_id, label, price, concession, concession_caption from membership_types')
    res.send(results)
  } catch (err) {
    console.log(err)
    return res.sendStatus(500)
  }
})

const signupProps = ['firstname', 'lastname', 'suburb', 'postcode', 'email', 'phone', 'membership_type_id', 'concession', 'sendemails']

router.post('/signup', async (req, res) => {
  try {
    await query(`INSERT into signup (${signupProps.join(', ')}) values($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, signupProps.map(prop => req.body[prop]))
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

export default router
