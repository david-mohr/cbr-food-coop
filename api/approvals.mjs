import express from 'express'
import { DateTime } from 'luxon'
import { uid } from 'quasar'
import { query } from './database.mjs'
import { hasRole } from './utils.mjs'

const router = express.Router()

router.post('/', hasRole('admin'), async (req, res) => {
  const date = null
  const members = req.body.members
  const sheetID = await query('INSERT INTO members_approval_sheets (datecreated, nummembers, dateapproved, approvedby, datesigned, signedby, notes VALUES($1, $2, $1, $3, $1, $3, $4) RETURNING id', [date, members.length, req.body.approvedby, req.body.notes])

  for (const member in members) {
    await query('INSERT INTO members_approval_sheets_members (member, approvalsheet) VALUES($1, $2)', [member, sheetID])
    await query('UPDATE customer SET approved = true WHERE id = $1', [member])
    // await sendConfirmed(member)
    // add to mailchimp for yani maybe?
  }

  // await query('INSERT into members_history (datenew, member, action, amountpaid, notes) values($1, $2, $3, $4, $5, $6)', [uid(), dateWorked, req.params.id, req.body.action, req.body.paid, req.body.notes])
})
