import { Connection, PublicKey } from '@solana/web3.js'
import { calcCost } from '../core/cost-calc'

interface AnalyzeOpts {
  network: string
}

export async function analyze(programId: string, opts: AnalyzeOpts) {
  const rpc = opts.network === 'mainnet'
    ? process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
    : process.env.DEVNET_RPC_URL || 'https://api.devnet.solana.com'

  console.log(`\nanalyzing ${programId} on ${opts.network}...\n`)

  const conn = new Connection(rpc)

  try {
    const pubkey = new PublicKey(programId)
    const accounts = await conn.getProgramAccounts(pubkey)

    console.log(`found ${accounts.length} accounts`)

    if (accounts.length > 0) {
      // group by account data size
      const sizeGroups: Record<number, number> = {}
      let totalSize = 0
      for (const acc of accounts) {
        const size = acc.account.data.length
        sizeGroups[size] = (sizeGroups[size] || 0) + 1
        totalSize += size
      }

      const avgSize = Math.round(totalSize / accounts.length)
      const report = calcCost(avgSize, accounts.length)

      console.log(`size groups:    ${Object.keys(sizeGroups).length}`)
      console.log(`avg size:       ${avgSize} bytes`)
      console.log(`estimated rent: ${(report.regularCost / 1e9).toFixed(4)} SOL`)
      console.log(`compressed:     ${(report.compressedCost / 1e9).toFixed(4)} SOL`)
      console.log(`savings:        ${report.savingsPct}%`)
      console.log(`\nrun 'compresskit cost ${programId}' for detailed breakdown`)
    }
  } catch (e) {
    console.error(`error: ${e instanceof Error ? e.message : e}`)
    process.exit(1)
  }
}
