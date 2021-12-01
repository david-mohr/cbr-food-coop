#!/usr/bin/env node

import chalk from 'chalk'
import inquirer from 'inquirer'
import { sendInvite } from '../email.mjs'
import { emailRegex } from '../utils.mjs'

const roles = ['coordinator', 'admin']

async function main () {
  const account = await inquirer.prompt([{
    type: 'input',
    name: 'email',
    message: 'Email',
    validate (input) {
      return emailRegex.test(input)
    }
  }, {
    type: 'list',
    name: 'role',
    message: 'Role',
    choices: roles
  }])

  console.log(chalk.bold.cyan('INFO'), 'Sending invitation...')
  await sendInvite(account.email, account.role)
  console.log(chalk.bold.green('DONE'), 'invite sent')
  process.exit(0)
}

main()
