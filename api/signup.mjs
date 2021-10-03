import express from 'express'
import pg from 'pg'
const { Pool } = pg

const router = express.Router();

// Postgres
const config = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
};

// don't use SSL in development
if (process.env.NODE_ENV === 'development') {
  delete config.ssl;
}

const pool = new Pool(config);

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

export default router;
