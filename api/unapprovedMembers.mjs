import express from 'express'
import { query } from './database.mjs'
import { hasRole } from './utils.mjs'

const router = express.Router()

router.get('/', hasRole('coordinator'), async (req, res) => {
  try {
    const results = await query(`
    SELECT customers.id, customers.name, members_extra.isapproved 
    FROM customers INNER JOIN members_extra ON customers.id=members_extra.id 
    WHERE  members_extra.isapproved = false`)
    res.send(results)
  } catch (err) {
    console.log(err)
    return res.sendStatus(500)
  }
})

export default router
