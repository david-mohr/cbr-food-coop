const crypto = require('crypto');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const pool = new Pool({
  connectionString : 'postgres://postgres:Pass2021!@localhost:5432/postgres'
});
 
process.on('exit', () => {
  pool.end();
});

async function findUser(username) {
  const results = await query('SELECT * FROM auth WHERE username = $1', [username]);
  return results[0];
}

function checkPassword(user, password) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, user.salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      // probably don't need timingSafeEqual... but why not
      resolve(crypto.timingSafeEqual(Buffer.from(derivedKey.toString('hex')), Buffer.from(user.password)));
    });
  });
}

function makeSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function encryptPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = makeSalt();
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve({
        key: derivedKey.toString('hex'),
        salt
      });
    });
  });
}

function end() {
  return pool.end();
}

async function query(statement, args) {
  const client = await pool.connect();
  return new Promise((resolve, reject) => {
    return client.query(statement, args, (err, res) => {
      client.release();
      if (err) return reject(err);
      return resolve(res.rows);
    });
  });
}

module.exports.checkPassword = checkPassword;
module.exports.encryptPassword = encryptPassword;
module.exports.end = end;
module.exports.findUser = findUser;
module.exports.query = query;
