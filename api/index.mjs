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

const VEND_URL = 'https://thefoodcooperativeshop.vendhq.com/api/2.0'
async function vendTest () {
  try {
    /*
    const json = {
      first_name: 'TestFirst',
      last_name: 'TestLast',
      email: 'test@cbrfoodcoop.org.au',
      mobile: '0499 123 456',
      physical_suburb: '2601',
      physical_state: '2601',
      physical_postcode: '2601',
      physical_country_id: 'AU'
    }
    const newVendUser = await got.post(`${VEND_URL}/customers`, {
      headers: {
        authorization: `bearer ${process.env.VEND_API_KEY}`
      },
      json
    }).json()
    */
    const dave = await got.get(`${VEND_URL}/customers/${process.env.DAVES_VEND_ID}`, {
      headers: {
        Authorization: `Bearer ${process.env.VEND_API_KEY}`
      }
    }).json()
    console.log(dave)
  } catch (err) {
    console.log(err)
    // console.log(err.request)
    console.log(err.response.body)
  }
}
// emailTest()
// vendTest()
