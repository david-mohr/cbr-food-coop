import express from 'express'
import { query } from './database.mjs'
import { hasRole } from './utils.mjs'

const router = express.Router()

router.get('/', hasRole('coordinator'), async (req, res) => {
  try {
    const results = await query('SELECT * from memberships')
    res.send(results)
  } catch (err) {
    console.log(err)
    return res.sendStatus(500)
  }
})

router.get('/:id', hasRole('coordinator'), async (req, res) => {
  try {
    const membership = await query('SELECT * from memberships WHERE membership_id = $1', [req.params.id])
    if (!membership.length) return res.sendStatus(404)
    res.send(membership[0])
  } catch (err) {
    console.log(err)
    return res.sendStatus(500)
  }
})

export default router
