import express from 'express'
import got from 'got'

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
