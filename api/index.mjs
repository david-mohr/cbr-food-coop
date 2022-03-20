import express from 'express'

import unauthenticated from './unauthenticated.mjs'
import auth from './auth.mjs'
import members from './members.mjs'
import memberships from './memberships.mjs'
import signup from './signup.mjs'
import users from './users.mjs'
import invites from './invites.mjs'
import approvals from './approvals.mjs'

const router = express.Router()

// Any unauthenticated URLs needs to be listed inside server.mjs at the root of
// this project
router.use(unauthenticated)
router.use(auth)
router.use('/members', members)
router.use('/memberships', memberships)
router.use('/signups', signup)
router.use('/users', users)
router.use('/invites', invites)
router.use('/approvals', approvals)

export default router
