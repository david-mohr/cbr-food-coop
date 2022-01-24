import dotenv from 'dotenv'
import express from 'express'
import jwt from 'jsonwebtoken'
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt'
import { Strategy as LocalStrategy } from 'passport-local'
import passport from 'passport'

import { checkPassword, findUser } from './database.mjs'

dotenv.config()

const router = express.Router()

export function getUserToken (user) {
  if (!user) throw new Error('Must pass a user object')
  const body = { id: user.id, email: user.email, role: user.role }
  return jwt.sign(body, process.env.TOKEN_SECRET, { expiresIn: '12h' })
}

passport.use(
  'login',
  new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      console.log(email)
      const user = await findUser(email)
      console.log(user)
      if (!user) {
        return done(null, false, { message: 'User not found' })
      }

      const validate = await checkPassword(user, password)
      if (!validate) {
        console.log('Wrong Password')
        return done(null, false, { message: 'Wrong Password' })
      }
      console.log('success')
      return done(null, user, { message: 'Logged in successfully' })
    } catch (error) {
      return done(error)
    }
  })
)

passport.use(new JwtStrategy({
  secretOrKey: process.env.TOKEN_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}, async (token, done) => {
  try {
    token.iat = new Date(token.iat * 1000)
    token.exp = new Date(token.exp * 1000)
    return done(null, token)
  } catch (error) {
    done(error)
  }
}))

router.post('/login', (req, res, next) => {
  passport.authenticate('login', async (err, user, _info) => {
    try {
      if (err) {
        console.error('LOGIN ERROR:', err)
        return res.sendStatus(401)
      }
      if (!user) {
        return res.sendStatus(404)
      }

      req.login(user, { session: false }, async (error) => {
        if (error) return next(error)
        const token = getUserToken(user)
        return res.json({ token })
      })
    } catch (error) {
      return next(error)
    }
  })(req, res, next)
})

export default router
