const dotenv = require('dotenv');
const express = require('express');
const jwt = require('jsonwebtoken');
const { ExtractJwt, Strategy: JwtStrategy } = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');

dotenv.config();

const db = require('../database');

const router = express.Router();

passport.use(
    'login',
    new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password'
    }, async (username, password, done) => {
      try {
        const user = await db.findUser(username);
        if (!user) {
          return done(null, false, { message: 'User not found' });
        }

        const validate = await db.checkPassword(user, password);
        if (!validate) {
          return done(null, false, { message: 'Wrong Password' });
        }

        return done(null, user, { message: 'Logged in successfully' });
      } catch (error) {
        return done(error);
      }
    })
);

passport.use(new JwtStrategy({
  secretOrKey: process.env.TOKEN_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}, async (token, done) => {
  try {
    token.iat = new Date(token.iat * 1000);
    token.exp = new Date(token.exp * 1000);
    return done(null, token);
  } catch (error) {
    done(error);
  }
}));

router.post('/login', (req, res, next) => {
  passport.authenticate('login', async (err, user, _info) => {
    try {
      if (err) {
        console.error('LOGIN ERROR:', err);
        return res.sendStatus(401);
      }
      if (!user) {
        return res.sendStatus(404);
      }

      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);

        const body = { id: user.id, username: user.username, role: user.role };
        const token = jwt.sign(body, process.env.TOKEN_SECRET, { expiresIn: '12h' });

        return res.json({ token });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

module.exports = router;
