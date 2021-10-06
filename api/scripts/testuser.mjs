#!/usr/bin/env node

import chalk from 'chalk'
import inquirer from 'inquirer'
import { checkPassword, end, findUser } from '../database'

async function main () {
  let account = await inquirer.prompt({
    type: 'input',
    name: 'user',
    message: 'Username'
  })
  console.log(chalk.bold.cyan('INFO'), 'Checking user exists...')
  const user = await findUser(account.user)
  if (!user) {
    console.log(chalk.bold.red('ERR!'), 'User not found')
    end()
    process.exit(1)
  }
  console.log(user)
  end()
  account = await inquirer.prompt({
    type: 'password',
    name: 'password',
    message: 'Password',
    mask: '*'
  })

  if (await checkPassword(user, account.password)) {
    console.log(chalk.bold.green('SUCCESS'))
    process.exit(0)
  } else {
    console.log(chalk.bold.red('ERR!'), 'Password doesn\'t match')
    process.exit(1)
  }
}

main()
