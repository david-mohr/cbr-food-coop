import express from 'express'
import { query } from './database.mjs'
import { hasRole } from './utils.mjs'

const router = express.Router()

const memberProps = ['first_shop']

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

router.put('/:id', hasRole('coordinator'), async (req, res) => {
  try {
    // pluck out the valid props from the body
    const obj = pluck(memberProps, req.body)
    if (Object.keys(obj).length === 0) return res.sendStatus(400)
    // convert the object into an array of values and a SET statement
    const update = obj2update(obj)
    const results = await query(`UPDATE memberships SET ${update.set} WHERE membership_id = $${update.next} RETURNING *`, [...update.values, req.params.id])
    res.send(results)
  } catch (err) {
    console.log(err)
    return res.sendStatus(500)
  }
})

export default router
