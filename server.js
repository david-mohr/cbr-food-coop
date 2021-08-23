const express = require('express')
const morgan = require('morgan')
const passport = require('passport')
const path = require('path')
const serveStatic = require('serve-static')

const app = express()
const port = process.env.PORT || 5000
const api = require('./api')

app.disable('x-powered-by')
app.use(express.json({ limit: '5mb' }))
app.use(morgan('tiny'))
app.use(serveStatic(path.join(__dirname, 'dist/spa')))

app.use('/api', function isAuthenticated (req, res, next) {
  if (req.originalUrl === '/api/login') return next()
  return passport.authenticate('jwt', { session: false })(req, res, next)
})

app.use(api)

// Handle errors.
app.use(function (err, req, res, next) {
  console.log(err)
  res.status(err.status || 500)
  res.json({ error: err })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
