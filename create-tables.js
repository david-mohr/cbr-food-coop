const fs = require('fs')
const { Pool } = require('pg')

// these arrays will have blank last entry due to a trailling newline
const tables = fs.readFileSync('mock/tables.sql', 'utf8')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

// don't use SSL in development
if (process.env.NODE_ENV === 'development') {
  delete config.ssl
}

async function main () {
  let client
  try {
    client = await pool.connect()
    await client.query(tables)
  } catch (err) {
    console.error(err.message)
  }
  if (client) client.end()
}

main()
