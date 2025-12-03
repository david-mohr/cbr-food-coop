const fs = require('fs')
const { Pool } = require('pg')

// Parse command line arguments
const args = process.argv.slice(2)
const sqlFile = args[0]

// Parse remaining arguments for format, output file, and SQL parameters
let outputFormat, outputFile
const sqlParams = {}

for (let i = 1; i < args.length; i++) {
  const arg = args[i]
  if (arg === 'csv' || arg === 'json') {
    outputFormat = arg
  } else if (arg.includes('=')) {
    // SQL parameter in format key=value
    const [key, value] = arg.split('=', 2)
    sqlParams[key] = value
  } else if (!outputFile && !arg.includes('=')) {
    // Assume it's an output file if no = sign and no outputFile set yet
    outputFile = arg
  }
}

if (!sqlFile) {
  console.error('Usage: node run-sql.js <sql-file> [csv|json] [output-file] [param=value...]')
  console.error('  sql-file: Path to SQL file to execute')
  console.error('  csv|json: Optional format flag to output as CSV or JSON')
  console.error('  output-file: Optional file path to write output (otherwise outputs to stdout)')
  console.error('  param=value: SQL parameters (e.g., expiry_offset="-30 days")')
  console.error('')
  console.error('Examples:')
  console.error('  node run-sql.js sql/mailchimp-current.sql csv')
  console.error('  node run-sql.js sql/mailchimp-current.sql csv members.csv')
  console.error('  node run-sql.js sql/mailchimp-current.sql csv expiry_offset="-30 days"')
  console.error('  node run-sql.js sql/mailchimp-current.sql csv members.csv expiry_offset="-30 days" include_null_expiry="false"')
  process.exit(1)
}

const sql = fs.readFileSync(sqlFile, 'utf8')

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

// Function to escape CSV values
function escapeCSV (value) {
  if (value === null || value === undefined) {
    return ''
  }
  const stringValue = String(value)
  // If the value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

// Function to convert results to CSV
function resultsToCSV (results) {
  if (!results.rows || results.rows.length === 0) {
    return ''
  }

  // Get column headers from the first row
  const headers = Object.keys(results.rows[0])

  // Create CSV header row
  const csvHeaders = headers.map(escapeCSV).join(',')

  // Create CSV data rows
  const csvRows = results.rows.map(row =>
    headers.map(header => escapeCSV(row[header])).join(',')
  )

  return [csvHeaders, ...csvRows].join('\n')
}

async function main () {
  let client
  try {
    client = await pool.connect()

    // Set SQL parameters if provided
    for (const [key, value] of Object.entries(sqlParams)) {
      await client.query(`SELECT set_config('custom.${key}', $1, false)`, [value])
    }

    const results = await client.query(sql)

    let output
    if (outputFormat === 'csv') {
      output = resultsToCSV(results)
    } else {
      output = JSON.stringify(results.rows, null, 2)
    }

    if (outputFile) {
      fs.writeFileSync(outputFile, output)
      console.error(`Output written to ${outputFile}`)
      if (Object.keys(sqlParams).length > 0) {
        console.error(`Parameters used: ${JSON.stringify(sqlParams)}`)
      }
    } else {
      console.log(output)
    }
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  } finally {
    if (client) client.release()
    await pool.end()
  }
}

main()
