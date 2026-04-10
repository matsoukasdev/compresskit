"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = migrate;
const web3_js_1 = require("@solana/web3.js");
const cost_calc_1 = require("../core/cost-calc");
const output_1 = require("../core/output");
async function migrate(programId, opts) {
    const rpc = opts.network === 'mainnet'
        ? process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
        : process.env.DEVNET_RPC_URL || 'https://api.devnet.solana.com';
    (0, output_1.heading)(`compresskit migrate — ${opts.network}`);
    const spin = (0, output_1.spinner)(`scanning ${programId}...`);
    spin.start();
    try {
        const pubkey = new web3_js_1.PublicKey(programId);
        const conn = new web3_js_1.Connection(rpc);
        const accounts = await conn.getProgramAccounts(pubkey);
        if (accounts.length === 0) {
            spin.info('no accounts found for this program');
            return;
        }
        const sizeGroups = {};
        for (const acc of accounts) {
            const size = acc.account.data.length;
            sizeGroups[size] = (sizeGroups[size] || 0) + 1;
        }
        spin.succeed(`${accounts.length} accounts in ${Object.keys(sizeGroups).length} groups`);
        console.log('');
        let totalSavings = 0;
        let step = 1;
        for (const [sizeStr, count] of Object.entries(sizeGroups)) {
            const size = Number(sizeStr);
            const report = (0, cost_calc_1.calcCost)(size, count);
            totalSavings += report.regularCost - report.compressedCost;
            (0, output_1.info)(`step ${step}`, `compress ${count} accounts (${size} bytes)`);
            (0, output_1.info)('  rent', (0, output_1.solValue)(report.regularCost));
            (0, output_1.info)('  compressed', (0, output_1.solValue)(report.compressedCost));
            (0, output_1.info)('  savings', `${report.savingsPct}%`);
            console.log('');
            step++;
        }
        (0, output_1.divider)(40);
        (0, output_1.info)('total savings', (0, output_1.solValue)(totalSavings));
        (0, output_1.info)('output dir', opts.output);
        (0, output_1.warn)('code generation coming in next release');
        (0, output_1.success)('migration plan generated');
    }
    catch (e) {
        spin.fail('migration planning failed');
        (0, output_1.handleError)(e);
    }
}
//# sourceMappingURL=migrate.js.map