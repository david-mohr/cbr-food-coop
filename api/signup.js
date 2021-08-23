const express = require('express');
const { Pool } = require('pg');

const router = express.Router();

// Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

router.post('/signup', async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query('INSERT into signup(name, phone, email) values($1, $2, $3) RETURNING *', [req.body.name, req.body.phone, req.body.email]);
    client.release();
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error ' + err);
  }
});

module.exports = router;
