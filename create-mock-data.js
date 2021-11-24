const fs = require('fs')
const { DateTime } = require('luxon')
const { Pool } = require('pg')
const { uid } = require('quasar')

// these arrays will have blank last entry due to a trailling newline
const givenNames = fs.readFileSync('mock/given.txt', 'utf8').split('\n')
const familyNames = fs.readFileSync('mock/family.txt', 'utf8').split('\n')
const streetNames = fs.readFileSync('mock/street.txt', 'utf8').split('\n')
const streetTypes = ['St', 'Rd', 'Cres', 'Pl', 'Cct', 'Ave']
const cities = ['Belconnen', 'Gungahlin', 'Inner North', 'Inner South', 'Tuggeranong', 'Weston Creek', 'Woden']
const duties = ['cleaning', 'cafe', 'coordinator', 'washing', 'yoghurt']
const tables = fs.readFileSync('mock/tables.sql', 'utf8')

function randomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function random (array) {
  // minus 2 to skip the last blank entry
  return array[randomInt(0, array.length - 2)]
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

const MEMBER_ID_START = 1000
const MEMBER_COUNT = 100

async function main () {
  let client
  try {
    client = await pool.connect()
    await client.query(tables)
    for (let id = MEMBER_ID_START; id < MEMBER_ID_START + MEMBER_COUNT; ++id) {
      const given = random(givenNames)
      const family = random(familyNames)
      const name = `${given} ${family}`
      const addr = `${randomInt(1, 200)} ${random(streetNames)} ${random(streetTypes)}`
      const postcode = randomInt(2600, 2699)
      const city = random(cities)
      const email = `${given}.${family}@email.com`
      const phone = `04${randomInt(10000000, 99999999)}`
      // customer join sometime in the last 3 years
      const joindate = DateTime.now().minus({ days: randomInt(0, 3 * 365) })
      console.log('ADD CUSTOMER:', `c${id}`, name, addr, postcode, city, given, family, email, phone, joindate.toString(), true)
      await client.query('INSERT into customers (id, name, address, postal, city, firstname, lastname, email, phone, curdate, visible) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *', [`c${id}`, name, addr, postcode, city, given, family, email, phone, joindate.toString(), true])

      // for argument, let's say 75% of people volunteer
      const isVollie = randomInt(1, 4) !== 4
      const discvaliduntil = isVollie ? DateTime.now().plus({ days: randomInt(-500, 500) }) : null
      // extra random expiry and discount
      await client.query('INSERT into members_extra (id, discvaliduntil, membershipexpires) values($1, $2, $3) RETURNING *', [`c${id}`, discvaliduntil, DateTime.now().plus({ days: randomInt(-500, 500) })])

      let history = joindate
      await client.query('INSERT into members_history (id, datenew, member, action, amountpaid, notes) values($1, $2, $3, $4, $5, $6) RETURNING *', [uid(), history.toString(), `c${id}`, 'Applied', 10, '12 months'])
      await client.query('INSERT into members_history (id, datenew, member, action, amountpaid, notes) values($1, $2, $3, $4, $5, $6) RETURNING *', [uid(), history.toString(), `c${id}`, 'Registered', null, 'Entered into database'])
      if (history < DateTime.now().minus({ days: 30 })) {
        await client.query('INSERT into members_history (id, datenew, member, action, amountpaid, notes) values($1, $2, $3, $4, $5, $6) RETURNING *', [uid(), history.plus({ days: 7 }).toString(), `c${id}`, 'Approved', null, 'Approval sheet ###'])
      }

      if (!isVollie) continue
      // random history events
      const today = DateTime.now()
      history = history.plus({ days: randomInt(0, 30) })
      while (history < today) {
        const hours = randomInt(1, 5)
        const duty = random(duties)
        console.log('  HISTORY:', history.toString(), `c${id}`, 'Volunteered', hours, duty)
        await client.query('INSERT into members_history (id, datenew, member, action, amountpaid, notes) values($1, $2, $3, $4, $5, $6) RETURNING *', [uid(), history.toString(), `c${id}`, 'Volunteered', hours, duty])
        history = history.plus({ days: randomInt(0, 30) })
      }
    }
  } catch (err) {
    console.error(err.message)
  }
  if (client) client.release()
}

main()
