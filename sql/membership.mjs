import { query } from '../api/database.mjs'

async function main () {
  const membersExtra = await query('SELECT id, membershipexpires, discvaliduntil FROM members_extra')
  for (const me of membersExtra) {
    console.log(me.id)
    await query('INSERT INTO memberships (membership_id, membership_type_id, expires, discvaliduntil) VALUES ($1, 1, $2, $3) ON CONFLICT (membership_id) DO NOTHING', [me.id.replace(/c/i, 'm'), me.membershipexpires, me.discvaliduntil])
  }
  // await query('ALTER TABLE members_extra DROP COLUMN IF EXISTS membershipexpires');
  // await query('ALTER TABLE members_extra DROP COLUMN IF EXISTS discvaliduntil');

  process.exit(0)
}

main()
