import crypto from 'crypto'
import dotenv from 'dotenv'
import pg from 'pg'
const { Pool } = pg

dotenv.config()

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

process.on('exit', () => {
  // TODO figure out if the pool is already ended
  pool.end()
})

export async function findUser (username) {
  const results = await query('SELECT * FROM auth WHERE username = $1', [username])
  return results[0]
}

export function checkPassword (user, password) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, user.salt, 64, (err, derivedKey) => {
      if (err) return reject(err)
      // probably don't need timingSafeEqual... but why not
      resolve(crypto.timingSafeEqual(Buffer.from(derivedKey.toString('hex')), Buffer.from(user.password)))
    })
  })
}

export function makeSalt () {
  return crypto.randomBytes(16).toString('hex')
}

export function encryptPassword (password) {
  return new Promise((resolve, reject) => {
    const salt = makeSalt()
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err)
      resolve({
        key: derivedKey.toString('hex'),
        salt
      })
    })
  })
}

export function end () {
  return pool.end()
}

export async function query (statement, args) {
  const client = await pool.connect()
  return new Promise((resolve, reject) => {
    return client.query(statement, args, (err, res) => {
      client.release()
      if (err) return reject(err)
      return resolve(res.rows)
    })
  })
}
