const express = require('express');
const { encryptPassword, query } = require('../database');
const { hasRole }  = require('../utils');

const router = express.Router();

router.get('/', hasRole('admin'), async (req, res) => {
  try {
    const results = await query('SELECT id, username, role from auth');
    res.send(results);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.post('/', hasRole('admin'), async (req, res) => {
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
    const results = await query('INSERT INTO auth (username, password, salt, role) VALUES($1, $2, $3, $4)', [req.body.username, key, salt, req.body.role]);
    console.log('RESULTS', results);
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

module.exports = router;
