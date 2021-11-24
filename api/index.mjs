import express from 'express'
import got from 'got'
import FormData from 'form-data'

import auth from './auth.mjs'
import members from './members.mjs'
import unapprovedMembers from './unapprovedMembers.mjs'
import signup from './signup.mjs'
import users from './users.mjs'

const router = express.Router()

router.use(signup)
router.use(auth)
router.use('/members', members)
router.use('/unapproved-members', unapprovedMembers)
router.use('/users', users)

export default router

const API_URL = `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}`
async function emailTest () {
  try {
    const body = new FormData()
    body.append('from', 'info@cbrfoodcoop.org.au')
    body.append('to', 'morloch@gmail.com')
    body.append('subject', 'This is subject')
    body.append('text', 'Text body')
    body.append('html', '<b>HTML</b> version of the body!')
    await got.post(`${API_URL}/messages`, {
      username: 'api',
      password: process.env.MAILGUN_API_KEY,
      body
    })
  } catch (err) {
    console.log(err.request)
    console.log(err.response.body)
  }
}
