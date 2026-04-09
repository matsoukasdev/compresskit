#!/usr/bin/env node

import { Command } from 'commander'
import { analyze } from './commands/analyze'
import { cost } from './commands/cost'
import { template } from './commands/template'
import { migrate } from './commands/migrate'
import { verify } from './commands/verify'

const cli = new Command()

cli
  .name('compresskit')
  .version('0.1.0')
  .description('ZK Compression migration toolkit for Solana')

cli
  .command('analyze <programId>')
  .option('-n, --network <network>', 'devnet or mainnet', 'devnet')
  .description('analyze program accounts for compression')
  .action(analyze)

cli
  .command('cost <programId>')
  .option('-n, --network <network>', 'devnet or mainnet', 'devnet')
  .description('compare regular vs compressed costs')
  .action(cost)

cli
  .command('template <type>')
  .option('-o, --output <dir>', 'output directory', '.')
  .description('scaffold compressed project (loyalty, gaming, social)')
  .action(template)

cli
  .command('migrate <programId>')
  .option('-n, --network <network>', 'devnet or mainnet', 'devnet')
  .option('-o, --output <dir>', 'output directory', '.')
  .description('generate migration plan for ZK compression')
  .action(migrate)

cli
  .command('verify <programId>')
  .option('-n, --network <network>', 'devnet or mainnet', 'devnet')
  .description('verify compression migration status')
  .action(verify)

cli.parse()
