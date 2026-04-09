import { Connection, PublicKey } from '@solana/web3.js'
import { calcCost } from '../core/cost-calc'

interface MigrateOpts {
  network: string
  output: string
}

export async function migrate(programId: string, opts: MigrateOpts) {
  const rpc = opts.network === 'mainnet'
    ? process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
    : process.env.DEVNET_RPC_URL || 'https://api.devnet.solana.com'

  console.log(`\ngenerating migration plan for ${programId} on ${opts.network}...\n`)

  const conn = new Connection(rpc)

  try {
    const pubkey = new PublicKey(programId)
    const accounts = await conn.getProgramAccounts(pubkey, {
      dataSlice: { offset: 0, length: 0 },
    })

    if (accounts.length === 0) {
      console.log('no accounts found for this program')
      return
    }

    // group accounts by data size
    const sizeGroups: Record<number, number> = {}
    for (const acc of accounts) {
      const size = acc.account.data.length
      sizeGroups[size] = (sizeGroups[size] || 0) + 1
    }

    console.log(`found ${accounts.length} accounts in ${Object.keys(sizeGroups).length} size groups\n`)
    console.log('migration plan:')
    console.log('─'.repeat(60))

    let totalSavings = 0
    let step = 1

    for (const [sizeStr, count] of Object.entries(sizeGroups)) {
      const size = Number(sizeStr)
      const report = calcCost(size, count)
      totalSavings += report.regularCost - report.compressedCost

      console.log(`step ${step}: compress ${count} accounts (${size} bytes each)`)
      console.log(`  regular rent: ${(report.regularCost / 1e9).toFixed(4)} SOL`)
      console.log(`  compressed:   ${(report.compressedCost / 1e9).toFixed(4)} SOL`)
      console.log(`  savings:      ${report.savingsPct}%`)
      console.log('')
      step++
    }

    console.log('─'.repeat(60))
    console.log(`total savings: ${(totalSavings / 1e9).toFixed(4)} SOL`)
    console.log(`output dir: ${opts.output}`)
    console.log('\nmigration code generation coming in next release')

  } catch (e) {
    console.error(`error: ${e instanceof Error ? e.message : e}`)
    process.exit(1)
  }
}
