"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyze = analyze;
const web3_js_1 = require("@solana/web3.js");
const cost_calc_1 = require("../core/cost-calc");
const output_1 = require("../core/output");
async function analyze(programId, opts) {
    const rpc = opts.network === 'mainnet'
        ? process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
        : process.env.DEVNET_RPC_URL || 'https://api.devnet.solana.com';
    (0, output_1.heading)(`compresskit analyze`);
    const spin = (0, output_1.spinner)(`scanning ${programId} on ${opts.network}...`);
    spin.start();
    try {
        const pubkey = new web3_js_1.PublicKey(programId);
        const conn = new web3_js_1.Connection(rpc);
        const accounts = await conn.getProgramAccounts(pubkey);
        spin.succeed(`found ${accounts.length} accounts`);
        if (accounts.length === 0) {
            (0, output_1.info)('status', 'no accounts — nothing to compress');
            return;
        }
        const sizeGroups = {};
        let totalSize = 0;
        for (const acc of accounts) {
            const size = acc.account.data.length;
            sizeGroups[size] = (sizeGroups[size] || 0) + 1;
            totalSize += size;
        }
        const avgSize = Math.round(totalSize / accounts.length);
        const report = (0, cost_calc_1.calcCost)(avgSize, accounts.length);
        console.log('');
        (0, output_1.info)('accounts', accounts.length);
        (0, output_1.info)('size groups', Object.keys(sizeGroups).length);
        (0, output_1.info)('avg size', `${avgSize} bytes`);
        (0, output_1.divider)(40);
        (0, output_1.info)('estimated rent', (0, output_1.solValue)(report.regularCost));
        (0, output_1.info)('compressed', (0, output_1.solValue)(report.compressedCost));
        (0, output_1.info)('savings', (0, output_1.savingsHighlight)(report.savingsPct));
        (0, output_1.success)(`run 'compresskit cost ${programId}' for breakdown`);
    }
    catch (e) {
        spin.fail('analysis failed');
        (0, output_1.handleError)(e);
    }
}
//# sourceMappingURL=analyze.js.map