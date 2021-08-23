const crypto = require('crypto');
const dotenv = require('dotenv');
const mysql = require('mysql');

dotenv.config();

const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : process.env.DB_PASSWORD,
  database : 'openbravo-pos'
});
 
process.on('exit', () => {
  connection.end();
});

connection.connect();

async function findUser(username) {
  const { results } = await query('SELECT * FROM auth WHERE username = ?', [username]);
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
  return connection.end();
}

function query(statement, args) {
  return new Promise((resolve, reject) => {
    return connection.query(statement, args, (err, results, fields) => {
      if (err) return reject(err);
      return resolve({results, fields});
    });
  });
}

module.exports.checkPassword = checkPassword;
module.exports.encryptPassword = encryptPassword;
module.exports.end = end;
module.exports.findUser = findUser;
module.exports.query = query;
