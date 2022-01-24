import express from 'express'
import got from 'got'

import unauthenticated from './unauthenticated.mjs'
import auth from './auth.mjs'
import members from './members.mjs'
import signup from './signup.mjs'
import users from './users.mjs'
import invites from './invites.mjs'

const router = express.Router()

router.use(unauthenticated)
router.use(auth)
router.use('/members', members)
router.use('/signups', signup)
router.use('/users', users)
router.use('/invites', invites)

export default router
