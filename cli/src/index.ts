#!/usr/bin/env node

import { Command, Option } from 'commander'
import { analyze } from './commands/analyze'
import { cost } from './commands/cost'
import { template } from './commands/template'
import { migrate } from './commands/migrate'
import { verify } from './commands/verify'

const cli = new Command()

const networkOption = () =>
  new Option('-n, --network <network>', 'devnet or mainnet')
    .choices(['devnet', 'mainnet'])
    .default('devnet')

cli
  .name('compresskit')
  .version('0.1.0')
  .description('ZK Compression migration toolkit for Solana')

cli
  .command('analyze <programId>')
  .addOption(networkOption())
  .option('--json', 'output a single json line for ci pipelines')
  .description('analyze program accounts for compression')
  .addHelpText('after', `
Example:
  $ compresskit analyze 9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin
  $ compresskit analyze <id> -n mainnet
  $ compresskit analyze <id> --json | jq .savingsPct`)
  .action(analyze)

cli
  .command('cost <programId>')
  .addOption(networkOption())
  .description('compare regular vs compressed costs')
  .addHelpText('after', `
Example:
  $ compresskit cost <programId>`)
  .action(cost)

cli
  .command('template <type>')
  .option('-o, --output <dir>', 'output directory', '.')
  .option('-f, --force', 'overwrite files if the output dir is non-empty')
  .description('scaffold compressed project (loyalty, gaming, social)')
  .addHelpText('after', `
Example:
  $ compresskit template loyalty -o ./my-loyalty
  $ compresskit template gaming --force`)
  .action(template)

cli
  .command('migrate <programId>')
  .addOption(networkOption())
  .option('-o, --output <dir>', 'output directory', '.')
  .description('generate migration plan for ZK compression')
  .addHelpText('after', `
Example:
  $ compresskit migrate <programId> -o ./migration`)
  .action(migrate)

cli
  .command('verify <programId>')
  .addOption(networkOption())
  .description('verify compression migration status')
  .addHelpText('after', `
Example:
  $ compresskit verify <programId>`)
  .action(verify)

cli.parse()
