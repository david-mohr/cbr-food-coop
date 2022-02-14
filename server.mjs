import express from 'express'
import morgan from 'morgan'
import passport from 'passport'
import serveStatic from 'serve-static'
import history from 'connect-history-api-fallback'

import api from './api/index.mjs'

const app = express()
const port = process.env.PORT || 5000

app.disable('x-powered-by')
app.use(express.json({ limit: '5mb' }))
app.use(morgan('tiny'))

// Force the use of HTTPS
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`)
    } else {
      next()
    }
  })
}

app.use(serveStatic('./dist/spa'))

const publicUrls = ['/api/login', '/api/forgot', '/api/signup', '/api/membership-types']

app.use('/api', function isAuthenticated (req, res, next) {
  if (publicUrls.includes(req.originalUrl)) return next()
  if (/\/api\/invites\/[a-z0-9]+\/accept/i.test(req.originalUrl)) return next()
  return passport.authenticate('jwt', { session: false })(req, res, next)
})

app.use('/api', api)

// Catch-all for history mode
app.use(history())
app.use(serveStatic('./dist/spa'))

// Handle errors.
app.use(function (err, req, res, next) {
  console.log(err)
  res.status(err.status || 500)
  res.json({ error: err })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
