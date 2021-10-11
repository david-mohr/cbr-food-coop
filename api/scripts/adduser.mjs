#!/usr/bin/env node

import chalk from 'chalk'
import inquirer from 'inquirer'
import { encryptPassword, query } from '../database.mjs'

const roles = ['user', 'coordinator', 'admin']

async function main () {
  const account = await inquirer.prompt([{
    type: 'input',
    name: 'user',
    message: 'Username'
  }, {
    type: 'password',
    name: 'password',
    message: 'Password',
    mask: '*'
  }, {
    type: 'password',
    name: 'password2',
    message: 'Confirm password',
    mask: '*'
  }, {
    type: 'list',
    name: 'role',
    message: 'Role',
    choices: roles
  }])

  if (account.password !== account.password2) {
    console.log(chalk.bold.red('ERR!'), 'Passwords don\'t match')
    process.exit(1)
  }

  console.log(chalk.bold.cyan('INFO'), 'Encrypting password...')
  const { key, salt } = await encryptPassword(account.password)

  console.log(chalk.bold.cyan('INFO'), 'Adding user...')
  const results = await query('INSERT INTO auth (username, password, salt, role) VALUES($1, $2, $3, $4) RETURNING *', [account.user, key, salt, account.role])
  console.log(chalk.bold.cyan('INFO'), 'Results')
  console.log('RESULTS', results)
  console.log(chalk.bold.green('DONE'))
  process.exit(0)
}

main()
