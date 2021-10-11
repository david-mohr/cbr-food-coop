import express from 'express'
import { DateTime } from 'luxon'
import { uid } from 'quasar'
import { query } from './database.mjs'
import { hasRole } from './utils.mjs'

const router = express.Router()
const ACTIONS = ['Applied', 'Registered', 'Approved', 'Volunteered']
const DAYS_DISCOUNT_PER_HOUR_WORKED = 14
const memberProps = ['name', 'address', 'city', 'postal', 'email', 'phone']

const hasOwnProperty = Object.prototype.hasOwnProperty
function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

function obj2update (obj) {
  const set = []
  const values = []
  let index = 1
  for (const key in obj) {
    set.push(`${key} = $${index++}`)
    values.push(obj[key])
  }
  return {
    values,
    set: set.join(', '),
    next: index
  }
}

function pluck (props, obj) {
  return props.reduce((acc, prop) =>
    hasOwn(obj, prop)
      ? { ...acc, [prop]: obj[prop] }
      : acc,
  {})
}

router.get('/', hasRole('coordinator'), async (req, res) => {
  try {
    const results = await query('SELECT * from customers')
    res.send(results)
  } catch (err) {
    console.log(err)
    return res.sendStatus(500)
  }
})

router.put('/:id', hasRole('coordinator'), async (req, res) => {
  try {
    // pluck out the valid props from the body
    const obj = pluck(memberProps, req.body)
    if (Object.keys(obj).length === 0) return res.sendStatus(400)
    // convert the object into an array of values and a SET statement
    const update = obj2update(obj)
    const results = await query(`UPDATE customers SET ${update.set} WHERE id = $${update.next} RETURNING *`, [...update.values, req.params.id])
    res.send(results)
  } catch (err) {
    console.log(err)
    return res.sendStatus(500)
  }
})

router.get('/:id/history', hasRole('coordinator'), async (req, res) => {
  try {
    if (!/^c[0-9]*$/.test(req.params.id)) {
      return res.send(400, '')
    }
    const results = await query('SELECT datenew, action, amountpaid, notes FROM members_history WHERE member = $1 ORDER BY datenew DESC', [req.params.id])
    res.send(results)
  } catch (err) {
    console.log(err)
    return res.sendStatus(500)
  }
})

export async function updateVolunteerHours (memberId, hoursWorked) {
  const results = await query('SELECT discvaliduntil FROM members_extra WHERE ID = $1', [memberId])
  if (!results.length) throw new Error(`Failed to find members_extra for member: ${memberId}`)
  let startDate = DateTime.now().startOf('day')
  if (results[0].discvaliduntil) {
    const dbStartDate = DateTime.fromJSDate(results[0].discvaliduntil)
    if (dbStartDate > startDate) startDate = dbStartDate
  }
  // 14 days of discount for every hour worked
  const newDiscount = startDate.plus({ days: hoursWorked * DAYS_DISCOUNT_PER_HOUR_WORKED })
  await query('UPDATE members_extra SET discvaliduntil = $1 WHERE id = $2 RETURNING *', [newDiscount.toString(), memberId])
}

/**
 * body.date
 * body.action
 * body.paid
 * body.notes
 */
router.post('/:id/history', hasRole('coordinator'), async (req, res) => {
  try {
    if (!/^c[0-9]*$/.test(req.params.id)) {
      return res.send(400, 'Invalid member ID')
    }
    if (!Number.isFinite(req.body.paid)) {
      return res.send(400, 'Invalid paid (Must be a number)')
    }
    if (!ACTIONS.includes(req.body.action)) {
      return res.send(400, 'Invalid action')
    }
    if (req.body.date && !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(req.body.date)) {
      return res.send(400, 'Invalid date')
    }
    const dateWorked = req.body.date || DateTime.now().toString()
    await query('INSERT into members_history (id, datenew, member, action, amountpaid, notes) values($1, $2, $3, $4, $5, $6)', [uid(), dateWorked, req.params.id, req.body.action, req.body.paid, req.body.notes])
    // Check if we need to update the discount date
    if (req.body.action === 'Volunteered') {
      await updateVolunteerHours(req.params.id, req.body.paid)
    }
    res.sendStatus(204)
  } catch (err) {
    console.log(err)
    return res.sendStatus(500)
  }
})

router.get('/:id/status', hasRole('coordinator'), async (req, res) => {
  try {
    if (!/^c[0-9]*$/.test(req.params.id)) {
      return res.send(400, '')
    }
    const results = await query('SELECT membershipexpires, discvaliduntil FROM members_extra WHERE id = $1', [req.params.id])
    if (!results.length) {
      return res.sendStatus(404)
    }
    res.send(results[0])
  } catch (err) {
    console.log(err)
    return res.sendStatus(500)
  }
})

export default router
