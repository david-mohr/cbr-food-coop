const express = require('express');
const { encryptPassword, query } = require('./database');

const auth = require('./auth');
const signup = require('./signup');

const router = express.Router();

const roles = ['user', 'coordinator', 'admin'];

function hasRole (role) {
  return (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === role) {
      next();
    } else {
      res.send(403, 'Insufficient permissions');
    }
  };
}

router.use(signup);
router.use(auth);
router.get('/members', hasRole('coordinator'), async (req, res) => {
  try {
    const results = await query('SELECT * from customers');
    res.send(results);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.get('/members/:id/history', hasRole('coordinator'), async (req, res) => {
  try {
    if (!/^c[0-9]*$/.test(req.params.id)) {
      return res.send(400, '');
    }
    const results = await query('SELECT DATENEW, ACTION, AMOUNTPAID, NOTES FROM members_history WHERE MEMBER = ? ORDER BY DATENEW DESC', [req.params.id]);
    res.send(results);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.get('/members/:id/status', hasRole('coordinator'), async (req, res) => {
  try {
    if (!/^c[0-9]*$/.test(req.params.id)) {
      return res.send(400, '');
    }
    const results = await query('SELECT MEMBERSHIPEXPIRES, DISCVALIDUNTIL FROM members_extra WHERE ID = ?', [req.params.id]);
    if (!results.length) {
      return res.sendStatus(404);
    }
    res.send(results[0]);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.get('/users', hasRole('admin'), async (req, res) => {
  try {
    const results = await query('SELECT id, username, role from auth');
    res.send(results);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.post('/users', hasRole('admin'), async (req, res) => {
  try {
    if (!roles.includes(req.body.role)) {
      return res.status(400).send({ error: 'Invalid role' });
    }
    if (!/^[a-z0-9]+$/i.test(req.body.username)) {
      return res.status(400).send({ error: 'Invalid username' });
    }
    if (typeof req.body.password === 'string' && req.body.password.length < 8) {
      return res.status(400).send({ error: 'Invalid password' });
    }
    const { key, salt } = await encryptPassword(req.body.password);
    const results = await query('INSERT INTO auth (username, password, salt, role) VALUES(?, ?, ?, ?)', [req.body.username, key, salt, req.body.role]);
    console.log('RESULTS', results);
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

module.exports = router;
