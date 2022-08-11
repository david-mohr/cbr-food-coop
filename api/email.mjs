import FormData from 'form-data'
import Mailgun from 'mailgun.js'
import { makeSalt, query } from './database.mjs'

const mailgun = new Mailgun(FormData)
const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY })

const fromEmail = process.env.COOP_EMAIL

export async function sendInvite (email, role) {
  try {
    const token = makeSalt()
    await query('INSERT INTO invites (email, role, token) VALUES($1, $2, $3) RETURNING *', [email, role, token])
    const mailgunData = {
      from: fromEmail,
      to: email,
      subject: `Please verify your ${process.env.COOP_NAME} account`,
      template: 'invite',
      'h:X-Mailgun-Variables': JSON.stringify({ token })
    }
    const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, mailgunData)
    console.log(response)
  } catch (err) {
    console.log(err)
  }
}

export async function sendPasswordReset (email) {
  try {
    email = email.toLowerCase()
    const user = await query('SELECT id FROM auth WHERE email = $1', [email])
    if (!user?.length) {
      throw new Error('User not found')
    }
    const token = makeSalt()
    await query('INSERT INTO password_reset (auth_id, token) VALUES($1, $2) RETURNING *', [user[0].id, token])
    const mailgunData = {
      from: fromEmail,
      to: email,
      subject: `Reset your ${process.env.COOP_NAME} password`,
      template: 'password-reset',
      'h:X-Mailgun-Variables': JSON.stringify({ token })
    }
    const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, mailgunData)
    console.log(response)
  } catch (err) {
    console.log(err)
  }
}
