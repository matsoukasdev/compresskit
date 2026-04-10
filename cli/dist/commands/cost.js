"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cost = cost;
const web3_js_1 = require("@solana/web3.js");
const cost_calc_1 = require("../core/cost-calc");
const output_1 = require("../core/output");
async function cost(programId, opts) {
    const rpc = opts.network === 'mainnet'
        ? process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
        : process.env.DEVNET_RPC_URL || 'https://api.devnet.solana.com';
    (0, output_1.heading)(`compresskit cost — ${opts.network}`);
    const spin = (0, output_1.spinner)(`loading accounts for ${programId}...`);
    spin.start();
    try {
        const pubkey = new web3_js_1.PublicKey(programId);
        const conn = new web3_js_1.Connection(rpc);
        const accounts = await conn.getProgramAccounts(pubkey);
        if (accounts.length === 0) {
            spin.info('no accounts found');
            return;
        }
        spin.succeed(`${accounts.length} accounts loaded`);
        const sizeGroups = {};
        for (const acc of accounts) {
            const size = acc.account.data.length;
            sizeGroups[size] = (sizeGroups[size] || 0) + 1;
        }
        const cols = ['size', 'count', 'regular', 'compressed', 'savings'];
        const widths = [12, 8, 16, 16, 10];
        console.log('');
        (0, output_1.tableHeader)(cols, widths);
        let totalRegular = 0;
        let totalCompressed = 0;
        for (const [sizeStr, count] of Object.entries(sizeGroups)) {
            const size = Number(sizeStr);
            const report = (0, cost_calc_1.calcCost)(size, count);
            totalRegular += report.regularCost;
            totalCompressed += report.compressedCost;
            (0, output_1.tableRow)([
                `${size} B`,
                String(count),
                (0, output_1.solValue)(report.regularCost),
                (0, output_1.solValue)(report.compressedCost),
                `${report.savingsPct}%`,
            ], widths, [4]);
        }
        (0, output_1.divider)(widths.reduce((a, b) => a + b, 0));
        const totalPct = totalRegular > 0
            ? Math.round((1 - totalCompressed / totalRegular) * 100)
            : 0;
        (0, output_1.tableRow)([
            'TOTAL',
            String(accounts.length),
            (0, output_1.solValue)(totalRegular),
            (0, output_1.solValue)(totalCompressed),
            (0, output_1.savingsHighlight)(totalPct),
        ], widths, [4]);
        (0, output_1.success)(`save ${(0, output_1.solValue)(totalRegular - totalCompressed)} with ZK compression`);
    }
    catch (e) {
        spin.fail('cost analysis failed');
        (0, output_1.handleError)(e);
    }
}
//# sourceMappingURL=cost.js.map