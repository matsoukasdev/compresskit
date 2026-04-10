"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = verify;
const web3_js_1 = require("@solana/web3.js");
const output_1 = require("../core/output");
async function verify(programId, opts) {
    const rpc = opts.network === 'mainnet'
        ? process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
        : process.env.DEVNET_RPC_URL || 'https://api.devnet.solana.com';
    (0, output_1.heading)(`compresskit verify — ${opts.network}`);
    const spin = (0, output_1.spinner)(`checking ${programId}...`);
    spin.start();
    try {
        const pubkey = new web3_js_1.PublicKey(programId);
        const conn = new web3_js_1.Connection(rpc);
        const accounts = await conn.getProgramAccounts(pubkey);
        const totalAccounts = accounts.length;
        let totalRent = 0;
        for (const acc of accounts) {
            totalRent += acc.account.lamports;
        }
        spin.succeed('verification complete');
        console.log('');
        (0, output_1.info)('program', programId);
        (0, output_1.info)('network', opts.network);
        (0, output_1.info)('accounts', totalAccounts);
        (0, output_1.info)('rent held', (0, output_1.solValue)(totalRent));
        (0, output_1.divider)(40);
        if (totalAccounts === 0) {
            (0, output_1.success)('no uncompressed accounts — migration may be complete');
        }
        else {
            (0, output_1.warn)(`${totalAccounts} uncompressed accounts remaining`);
            (0, output_1.info)('next step', "run 'compresskit migrate' to generate plan");
        }
    }
    catch (e) {
        spin.fail('verification failed');
        (0, output_1.handleError)(e);
    }
}
//# sourceMappingURL=verify.js.map