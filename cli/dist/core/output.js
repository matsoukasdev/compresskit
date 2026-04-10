"use strict";
/**
 * CLI output utilities — chalk tables, ora spinners, error formatting.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.spinner = spinner;
exports.heading = heading;
exports.info = info;
exports.success = success;
exports.warn = warn;
exports.divider = divider;
exports.tableHeader = tableHeader;
exports.tableRow = tableRow;
exports.solValue = solValue;
exports.savingsHighlight = savingsHighlight;
exports.handleError = handleError;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
function spinner(text) {
    return (0, ora_1.default)({ text, color: 'cyan' });
}
function heading(text) {
    console.log(`\n${chalk_1.default.bold.white(text)}\n`);
}
function info(label, value) {
    console.log(`  ${chalk_1.default.gray(label.padEnd(18))}${chalk_1.default.white(String(value))}`);
}
function success(text) {
    console.log(`\n  ${chalk_1.default.green('✓')} ${chalk_1.default.green(text)}`);
}
function warn(text) {
    console.log(`  ${chalk_1.default.yellow('⚠')} ${chalk_1.default.yellow(text)}`);
}
function divider(width = 60) {
    console.log(chalk_1.default.gray('─'.repeat(width)));
}
function tableHeader(columns, widths) {
    const header = columns.map((col, i) => chalk_1.default.gray(col.padEnd(widths[i]))).join('');
    console.log(header);
    divider(widths.reduce((a, b) => a + b, 0));
}
function tableRow(values, widths, highlights) {
    const row = values.map((val, i) => {
        const padded = val.padEnd(widths[i]);
        if (highlights && highlights.includes(i))
            return chalk_1.default.green(padded);
        return chalk_1.default.white(padded);
    }).join('');
    console.log(row);
}
function solValue(lamports) {
    return `${(lamports / 1e9).toFixed(4)} SOL`;
}
function savingsHighlight(pct) {
    if (pct >= 80)
        return chalk_1.default.green.bold(`${pct}%`);
    if (pct >= 50)
        return chalk_1.default.green(`${pct}%`);
    if (pct >= 20)
        return chalk_1.default.yellow(`${pct}%`);
    return chalk_1.default.white(`${pct}%`);
}
function handleError(err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Invalid public key')) {
        console.error('\n  error: invalid program ID — must be a base58 Solana address');
    }
    else if (msg.includes('fetch failed') || msg.includes('ECONNREFUSED')) {
        console.error('\n  error: RPC connection failed — check your network or RPC_URL');
    }
    else if (msg.includes('429') || msg.includes('Too Many Requests')) {
        console.error('\n  error: rate limited — try again in a few seconds');
    }
    else {
        console.error(`\n  error: ${msg}`);
    }
    process.exit(1);
}
//# sourceMappingURL=output.js.map