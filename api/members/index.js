const express = require('express');
const { query } = require('../database');
const { hasRole }  = require('../utils');

const router = express.Router();

router.get('/', hasRole('coordinator'), async (req, res) => {
  try {
    const results = await query('SELECT * from customers');
    res.send(results);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.get('/:id/history', hasRole('coordinator'), async (req, res) => {
  try {
    if (!/^c[0-9]*$/.test(req.params.id)) {
      return res.send(400, '');
    }
    const results = await query('SELECT datenew, action, amountpaid, notes FROM members_history WHERE member = $1 ORDER BY datenew DESC', [req.params.id]);
    res.send(results);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.get('/:id/status', hasRole('coordinator'), async (req, res) => {
  try {
    if (!/^c[0-9]*$/.test(req.params.id)) {
      return res.send(400, '');
    }
    const results = await query('SELECT membershipexpires, discvaliduntil FROM members_extra WHERE id = $1', [req.params.id]);
    if (!results.length) {
      return res.sendStatus(404);
    }
    res.send(results[0]);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

module.exports = router;
