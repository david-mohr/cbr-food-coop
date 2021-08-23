const express = require('express');
const { query } = require('./database');
const auth = require('./auth');

const router = express.Router();

function hasRole (role) {
  return (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === role) {
      next();
    } else {
      res.send(403, 'Insufficient permissions');
    }
  };
}

router.put('/signup', auth);
router.use(auth);
router.get('/members', hasRole('coordinator'), async (req, res) => {
  try {
    const { results } = await query('SELECT * from customers');
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
    const { results } = await query('SELECT DATENEW, ACTION, AMOUNTPAID, NOTES FROM members_history WHERE MEMBER = ? ORDER BY DATENEW DESC', [req.params.id]);
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
    const { results } = await query('SELECT MEMBERSHIPEXPIRES, DISCVALIDUNTIL FROM members_extra WHERE ID = ?', [req.params.id]);
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
    const { results } = await query('SELECT id, username, role from auth');
    res.send(results);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

module.exports = router;
