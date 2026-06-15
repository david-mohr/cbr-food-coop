import mailchimp from '@mailchimp/mailchimp_marketing'
import pg from 'pg'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'
import { emailHash, formatMemberForMailchimp } from '../utils/mailchimp.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '..', '.env') })

// Configuration
const config = {
  mailchimp: {
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER_PREFIX,
    listId: process.env.MAILCHIMP_LIST_ID
  },
  database: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  },
  sync: {
    lookbackDays: parseInt(process.env.LOOKBACK_DAYS || '7'),
    batchSize: 500, // Mailchimp batch operations limit
    maxListSize: process.env.MAILCHIMP_MAX_LIST_SIZE ? parseInt(process.env.MAILCHIMP_MAX_LIST_SIZE) : 1000
  }
}

// don't use SSL in development
if (process.env.NODE_ENV === 'development') {
  delete config.database.ssl
}

// Initialize Mailchimp client
mailchimp.setConfig({
  apiKey: config.mailchimp.apiKey,
  server: config.mailchimp.server
})

/**
 * Get all members from Mailchimp list (with pagination)
 */
async function getAllMailchimpMembers () {
  const allMembers = []
  let offset = 0
  const count = 1000 // Max per page

  try {
    while (true) {
      const response = await mailchimp.lists.getListMembersInfo(
        config.mailchimp.listId,
        {
          count,
          offset,
          fields: ['members.email_address', 'members.status', 'members.merge_fields', 'members.tags', 'total_items']
        }
      )

      allMembers.push(...response.members)
      console.log(`Fetched ${allMembers.length} of ${response.total_items} Mailchimp members`)

      if (allMembers.length >= response.total_items) {
        break
      }

      offset += count
    }

    return allMembers
  } catch (error) {
    console.error('Failed to fetch Mailchimp members:', error)
    throw error
  }
}

/**
 * Get member data from database
 */
async function getMembersFromDatabase (lookbackDays, maxListSize = config.sync.maxListSize) {
  const client = new pg.Client({
    connectionString: config.database.connectionString,
    ssl: config.database.ssl
  })
  await client.connect()

  try {
    const sqlPath = join(__dirname, '..', '..', 'sql', 'mailchimp-export.sql')
    let sql = await fs.readFile(sqlPath, 'utf-8')

    // Replace parameters
    sql = sql.replace(':lookback_days', lookbackDays.toString()).replace(':max_list_size', maxListSize.toString())

    const result = await client.query(sql)
    console.log(`Retrieved ${result.rows.length} members from database`)
    return result.rows
  } finally {
    await client.end()
  }
}

/**
 * Sync unsubscribed status back to database
 */
async function syncUnsubscribesToDatabase (mailchimpMembers, dbMembers) {
  const client = new pg.Client({
    connectionString: config.database.connectionString,
    ssl: config.database.ssl
  })
  await client.connect()

  try {
    const unsubscribedEmails = mailchimpMembers
      .filter(m => m.status === 'unsubscribed')
      .map(m => m.email_address.toLowerCase())

    const dbEmailsSet = new Set(dbMembers.map(m => m.email.toLowerCase()))

    const emailsToUpdate = unsubscribedEmails.filter(email => dbEmailsSet.has(email))

    console.log(`Found ${unsubscribedEmails.length} unsubscribed members in Mailchimp`)
    console.log(`${emailsToUpdate.length} of these are in the current database export`)

    if (emailsToUpdate.length === 0) {
      console.log('No unsubscribes to sync back to database')
      return { updated: 0 }
    }

    // Update sendemails field in members_extra table
    const updateQuery = `
      INSERT INTO members_extra (id, sendemails)
      SELECT c.id, false
      FROM customers c
      WHERE LOWER(TRIM(c.email)) = ANY($1::text[])
      ON CONFLICT (id) DO UPDATE
      SET sendemails = false
    `

    const result = await client.query(updateQuery, [emailsToUpdate])
    console.log(`Updated ${result.rowCount} members to sendemails=false in database`)

    return { updated: result.rowCount }
  } catch (error) {
    console.error('Failed to sync unsubscribes to database:', error)
    throw error
  } finally {
    await client.end()
  }
}

/**
 * Archive members in Mailchimp who are no longer in the priority list
 */
async function archiveRemovedMembers (mailchimpMembers, dbMembers) {
  const dbEmailsSet = new Set(dbMembers.map(m => m.email.toLowerCase()))

  const membersToArchive = mailchimpMembers
    .filter(m => !dbEmailsSet.has(m.email_address.toLowerCase()))
    .filter(m => m.status !== 'archived') // Don't re-archive already archived members

  if (membersToArchive.length === 0) {
    console.log('No members to archive')
    return { archived: 0 }
  }

  console.log(`Found ${membersToArchive.length} members to archive (outside priority list)`)

  // Archive in batches - in practice should never be more than one.
  const batches = []
  for (let i = 0; i < membersToArchive.length; i += config.sync.batchSize) {
    batches.push(membersToArchive.slice(i, i + config.sync.batchSize))
  }

  let totalArchived = 0

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    const operations = batch.map(member => {
      const hash = emailHash(member.email_address)

      return {
        method: 'DELETE',
        path: `/lists/${config.mailchimp.listId}/members/${hash}`
      }
    })

    try {
      const response = await mailchimp.batches.start({ operations })
      console.log(`Archive batch ${i + 1}/${batches.length} started: ${response.id}`)

      // Wait for batch to complete
      let batchStatus
      do {
        await new Promise(resolve => setTimeout(resolve, 2000))
        batchStatus = await mailchimp.batches.status(response.id)
      } while (batchStatus.status !== 'finished')

      totalArchived += batchStatus.finished_operations - batchStatus.errored_operations
    } catch (error) {
      console.error(`Failed to archive batch ${i + 1}:`, error)
    }
  }

  console.log(`Archived ${totalArchived} members from Mailchimp`)
  return { archived: totalArchived }
}

/**
 * Sync members to Mailchimp in batches
 */
async function syncBatchToMailchimp (members) {
  const operations = members.map(member => {
    const body = {
      email_address: member.email_address,
      status_if_new: member.status_if_new,
      merge_fields: member.merge_fields,
      tags: member.tags // Always include tags, even if empty array
    }

    // Only set status if member already exists (to preserve unsubscribed status)
    if (member.status) {
      body.status = member.status
    }

    return {
      method: 'PUT',
      path: `/lists/${config.mailchimp.listId}/members/${member.email_hash}`,
      body: JSON.stringify(body)
    }
  })

  try {
    const response = await mailchimp.batches.start({
      operations
    })

    console.log(`Batch operation started: ${response.id}`)

    // Wait for batch to complete
    let batchStatus
    do {
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
      batchStatus = await mailchimp.batches.status(response.id)
      console.log(`Batch progress: ${batchStatus.finished_operations}/${batchStatus.total_operations}`)
    } while (batchStatus.status !== 'finished')

    if (batchStatus.errored_operations > 0) {
      console.error(`\n (!)  ${batchStatus.errored_operations} operations failed`)
      if (batchStatus.response_body_url) {
        console.error(`Error details (tar.gz): ${batchStatus.response_body_url}`)
      }
    }

    return {
      success: batchStatus.finished_operations - batchStatus.errored_operations,
      errors: batchStatus.errored_operations
    }
  } catch (error) {
    console.error('Batch operation failed:', error)
    throw error
  }
}

/**
 * Main sync function
 */
async function syncMailchimp () {
  console.log('Starting Mailchimp sync...')
  console.log('Configuration:', {
    lookbackDays: config.sync.lookbackDays,
    batchSize: config.sync.batchSize,
    maxListSize: config.sync.maxListSize
  })

  try {
    // Step 1: Get all current members from Mailchimp
    console.log('\n=== Fetching existing Mailchimp members ===')
    const mailchimpMembers = await getAllMailchimpMembers()
    const mailchimpMap = new Map(
      mailchimpMembers.map(m => [m.email_address.toLowerCase(), m])
    )
    console.log(`Found ${mailchimpMembers.length} existing members in Mailchimp`)

    // Step 2: Get priority members from database
    console.log('\n=== Fetching members from database ===')
    const dbMembers = await getMembersFromDatabase(config.sync.lookbackDays, config.sync.maxListSize)
    console.log(`Found ${dbMembers.length} members in database export`)

    if (dbMembers.length === 0) {
      console.log('No members to sync')
      return
    }

    // Step 3: Sync unsubscribed status back to database
    console.log('\n=== Syncing unsubscribes back to database ===')
    await syncUnsubscribesToDatabase(mailchimpMembers, dbMembers)

    // Step 4: Format members for Mailchimp, preserving existing data
    console.log('\n=== Preparing member updates ===')
    const formattedMembers = dbMembers.map(member => {
      const existingMember = mailchimpMap.get(member.email.toLowerCase())
      return formatMemberForMailchimp(member, existingMember)
    })

    // Step 5: Sync updates/additions to Mailchimp
    console.log('\n=== Syncing members to Mailchimp ===')
    const batches = []
    for (let i = 0; i < formattedMembers.length; i += config.sync.batchSize) {
      batches.push(formattedMembers.slice(i, i + config.sync.batchSize))
    }

    console.log(`Syncing ${formattedMembers.length} members in ${batches.length} batches`)

    let totalSuccess = 0
    let totalErrors = 0

    for (let i = 0; i < batches.length; i++) {
      console.log(`\nProcessing batch ${i + 1}/${batches.length} (${batches[i].length} members)`)
      const result = await syncBatchToMailchimp(batches[i])
      totalSuccess += result.success
      totalErrors += result.errors
    }

    console.log(`\nSync completed: ${totalSuccess} successful, ${totalErrors} errors`)

    // Step 6: Archive members who are no longer in the priority list
    console.log('\n=== Archiving members outside priority list ===')
    const archiveResult = await archiveRemovedMembers(mailchimpMembers, dbMembers)
    console.log(`Archived ${archiveResult.archived} members`)

    console.log('\nMailchimp sync completed successfully!')
  } catch (error) {
    console.error('Sync failed:', error)
    process.exit(1)
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncMailchimp()
}

export { syncMailchimp }
