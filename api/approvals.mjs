import express from 'express'
import { DateTime } from 'luxon'
import { uid } from 'quasar'
import { query } from './database.mjs'
import { hasRole } from './utils.mjs'

const router = express.Router()

router.post('/', hasRole('admin'), async (req, res) => {
  const date = DateTime.now().toISODate()
  const members = req.body.members
  const sheet = await query('INSERT INTO members_approval_sheets (id, datecreated, nummembers, dateapproved, approvedby, datesigned, signedby) values($4, $1, $2, $1, $3, $1, $3) RETURNING id', [date, members.length, req.body.approvedby, uid()])

  for (const member of members) {
    await query('INSERT INTO members_approval_sheets_members (id, member, approvalsheet) values($3, $1, $2)', [member, sheet[0].id, uid()])
    await query('UPDATE customers SET approved = true WHERE id = $1', [member])
    await query('INSERT into members_history (id, datenew, member, action, amountpaid, notes) values($1, $2, $3, $4, $5, $6)', [uid(), date, member, 'Approved', null, req.body.notes])
    // await sendConfirmed(member)
    // add to mailchimp for Yani maybe?
  }

  return res.sendStatus(201)
})

export default router
