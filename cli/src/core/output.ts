/**
 * CLI output utilities — chalk tables, ora spinners, error formatting.
 */

import chalk from 'chalk'
import ora from 'ora'

export function spinner(text: string) {
  return ora({ text, color: 'cyan' })
}

export function heading(text: string) {
  console.log(`\n${chalk.bold.white(text)}\n`)
}

export function info(label: string, value: string | number) {
  console.log(`  ${chalk.gray(label.padEnd(18))}${chalk.white(String(value))}`)
}

export function success(text: string) {
  console.log(`\n  ${chalk.green('✓')} ${chalk.green(text)}`)
}

export function warn(text: string) {
  console.log(`  ${chalk.yellow('⚠')} ${chalk.yellow(text)}`)
}

export function divider(width: number = 60) {
  console.log(chalk.gray('─'.repeat(width)))
}

export function tableHeader(columns: string[], widths: number[]) {
  const header = columns.map((col, i) => chalk.gray(col.padEnd(widths[i]))).join('')
  console.log(header)
  divider(widths.reduce((a, b) => a + b, 0))
}

export function tableRow(values: string[], widths: number[], highlights?: number[]) {
  const row = values.map((val, i) => {
    const padded = val.padEnd(widths[i])
    if (highlights && highlights.includes(i)) return chalk.green(padded)
    return chalk.white(padded)
  }).join('')
  console.log(row)
}

export function solValue(lamports: number): string {
  return `${(lamports / 1e9).toFixed(4)} SOL`
}

export function savingsHighlight(pct: number): string {
  if (pct >= 80) return chalk.green.bold(`${pct}%`)
  if (pct >= 50) return chalk.green(`${pct}%`)
  if (pct >= 20) return chalk.yellow(`${pct}%`)
  return chalk.white(`${pct}%`)
}

export function handleError(err: unknown): never {
  const msg = err instanceof Error ? err.message : String(err)

  if (msg.includes('excluded from account secondary indexes')) {
    console.error('\n  error: public RPC refused getProgramAccounts for this program')
    console.error('  hint:  set DEVNET_RPC_URL to a premium RPC (Helius / Triton / QuickNode)')
  } else if (msg.includes('Non-base58 character') || msg.includes('Invalid public key')) {
    console.error('\n  error: invalid program ID — must be a base58 Solana address')
  } else if (msg.includes('403') || msg.includes('Forbidden')) {
    console.error('\n  error: RPC blocked this request (403)')
    console.error('  hint:  set DEVNET_RPC_URL or RPC_URL to your own endpoint')
  } else if (msg.includes('429') || msg.includes('Too Many Requests')) {
    console.error('\n  error: rate limited (429) — try again in a few seconds')
  } else if (msg.includes('fetch failed') || msg.includes('ECONNREFUSED')) {
    console.error('\n  error: RPC connection failed — check network or RPC_URL')
  } else {
    console.error(`\n  error: ${msg}`)
  }

  process.exit(1)
}
