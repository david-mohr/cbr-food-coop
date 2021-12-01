import express from 'express'
import morgan from 'morgan'
import passport from 'passport'
import serveStatic from 'serve-static'

import api from './api/index.mjs'

const app = express()
const port = process.env.PORT || 5000

app.disable('x-powered-by')
app.use(express.json({ limit: '5mb' }))
app.use(morgan('tiny'))
app.use(serveStatic('./dist/spa'))

app.use('/api', function isAuthenticated (req, res, next) {
  if (req.originalUrl === '/api/login') return next()
  if (req.originalUrl === '/api/signup') return next()
  if (/\/api\/invites\/[a-z0-9]+\/accept/i.test(req.originalUrl)) return next()
  return passport.authenticate('jwt', { session: false })(req, res, next)
})

app.use('/api', api)

// Handle errors.
app.use(function (err, req, res, next) {
  console.log(err)
  res.status(err.status || 500)
  res.json({ error: err })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
