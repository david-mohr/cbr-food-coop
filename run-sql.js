const fs = require('fs')
const { Pool } = require('pg')

// these arrays will have blank last entry due to a trailling newline
const sql = fs.readFileSync(process.argv[2], 'utf8')

const config = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
}

// don't use SSL in development
if (process.env.NODE_ENV === 'development') {
  delete config.ssl
}

const pool = new Pool(config)

async function main () {
  let client
  try {
    client = await pool.connect()
    const results = await client.query(sql)
    console.log(results.rows)
  } catch (err) {
    console.error(err.message)
  }
  if (client) client.end()
}

main()
