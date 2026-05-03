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
  .description('analyze program accounts for compression')
  .action(analyze)

cli
  .command('cost <programId>')
  .addOption(networkOption())
  .description('compare regular vs compressed costs')
  .action(cost)

cli
  .command('template <type>')
  .option('-o, --output <dir>', 'output directory', '.')
  .description('scaffold compressed project (loyalty, gaming, social)')
  .action(template)

cli
  .command('migrate <programId>')
  .addOption(networkOption())
  .option('-o, --output <dir>', 'output directory', '.')
  .description('generate migration plan for ZK compression')
  .action(migrate)

cli
  .command('verify <programId>')
  .addOption(networkOption())
  .description('verify compression migration status')
  .action(verify)

cli.parse()
