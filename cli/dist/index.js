#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const analyze_1 = require("./commands/analyze");
const cost_1 = require("./commands/cost");
const template_1 = require("./commands/template");
const migrate_1 = require("./commands/migrate");
const verify_1 = require("./commands/verify");
const cli = new commander_1.Command();
const networkOption = () => new commander_1.Option('-n, --network <network>', 'devnet or mainnet')
    .choices(['devnet', 'mainnet'])
    .default('devnet');
cli
    .name('compresskit')
    .version('0.1.0')
    .description('ZK Compression migration toolkit for Solana');
cli
    .command('analyze <programId>')
    .addOption(networkOption())
    .description('analyze program accounts for compression')
    .action(analyze_1.analyze);
cli
    .command('cost <programId>')
    .addOption(networkOption())
    .description('compare regular vs compressed costs')
    .action(cost_1.cost);
cli
    .command('template <type>')
    .option('-o, --output <dir>', 'output directory', '.')
    .description('scaffold compressed project (loyalty, gaming, social)')
    .action(template_1.template);
cli
    .command('migrate <programId>')
    .addOption(networkOption())
    .option('-o, --output <dir>', 'output directory', '.')
    .description('generate migration plan for ZK compression')
    .action(migrate_1.migrate);
cli
    .command('verify <programId>')
    .addOption(networkOption())
    .description('verify compression migration status')
    .action(verify_1.verify);
cli.parse();
//# sourceMappingURL=index.js.map