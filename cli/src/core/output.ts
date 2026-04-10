/**
 * CLI output utilities — chalk tables, ora spinners, error formatting.
 * Uses dynamic import() for ESM-only deps (chalk v5, ora v8).
 */

let chalkInstance: typeof import('chalk').default | null = null
let oraFactory: typeof import('ora').default | null = null

async function getChalk() {
  if (!chalkInstance) {
    chalkInstance = (await import('chalk')).default
  }
  return chalkInstance
}

async function getOra() {
  if (!oraFactory) {
    oraFactory = (await import('ora')).default
  }
  return oraFactory
}

export async function spinner(text: string) {
  const ora = await getOra()
  return ora({ text, color: 'cyan' })
}

export async function heading(text: string) {
  const c = await getChalk()
  console.log(`\n${c.bold.white(text)}\n`)
}

export async function info(label: string, value: string | number) {
  const c = await getChalk()
  console.log(`  ${c.gray(label.padEnd(18))}${c.white(String(value))}`)
}

export async function success(text: string) {
  const c = await getChalk()
  console.log(`\n  ${c.green('✓')} ${c.green(text)}`)
}

export async function warn(text: string) {
  const c = await getChalk()
  console.log(`  ${c.yellow('⚠')} ${c.yellow(text)}`)
}

export async function divider(width: number = 60) {
  const c = await getChalk()
  console.log(c.gray('─'.repeat(width)))
}

export async function tableHeader(columns: string[], widths: number[]) {
  const c = await getChalk()
  const header = columns.map((col, i) => c.gray(col.padEnd(widths[i]))).join('')
  console.log(header)
  await divider(widths.reduce((a, b) => a + b, 0))
}

export async function tableRow(values: string[], widths: number[], highlights?: number[]) {
  const c = await getChalk()
  const row = values.map((val, i) => {
    const padded = val.padEnd(widths[i])
    if (highlights && highlights.includes(i)) return c.green(padded)
    return c.white(padded)
  }).join('')
  console.log(row)
}

export async function solValue(lamports: number): Promise<string> {
  return `${(lamports / 1e9).toFixed(4)} SOL`
}

export async function savingsHighlight(pct: number): Promise<string> {
  const c = await getChalk()
  if (pct >= 80) return c.green.bold(`${pct}%`)
  if (pct >= 50) return c.green(`${pct}%`)
  if (pct >= 20) return c.yellow(`${pct}%`)
  return c.white(`${pct}%`)
}

export function handleError(err: unknown): never {
  const msg = err instanceof Error ? err.message : String(err)

  if (msg.includes('Invalid public key')) {
    console.error('\n  error: invalid program ID — must be a base58 Solana address')
  } else if (msg.includes('fetch failed') || msg.includes('ECONNREFUSED')) {
    console.error('\n  error: RPC connection failed — check your network or RPC_URL')
  } else if (msg.includes('429') || msg.includes('Too Many Requests')) {
    console.error('\n  error: rate limited — try again in a few seconds')
  } else {
    console.error(`\n  error: ${msg}`)
  }

  process.exit(1)
}
