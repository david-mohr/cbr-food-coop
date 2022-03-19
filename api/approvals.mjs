import express from 'express'
import { DateTime } from 'luxon'
import { uid } from 'quasar'
import { query } from './database.mjs'
import { hasRole } from './utils.mjs'

const router = express.Router()

router.post('/', hasRole('admin'), async (req, res) => {
    await query('INSERT INTO members_approval_sheets (datecreated, nummembers, dateapproved, approvedby, datesigned, signedby, notes VALUES($1')
    // await query('INSERT into members_history (datenew, member, action, amountpaid, notes) values($1, $2, $3, $4, $5, $6)', [uid(), dateWorked, req.params.id, req.body.action, req.body.paid, req.body.notes])
  })