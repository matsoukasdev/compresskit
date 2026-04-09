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
    const accounts = await conn.getProgramAccounts(pubkey, {
      dataSlice: { offset: 0, length: 0 },
    })

    console.log(`found ${accounts.length} accounts`)

    if (accounts.length > 0) {
      const report = calcCost(128, accounts.length)
      console.log(`estimated rent: ${(report.regularCost / 1e9).toFixed(4)} SOL`)
      console.log(`compressed:     ${(report.compressedCost / 1e9).toFixed(4)} SOL`)
      console.log(`savings:        ${report.savingsPct}%`)
    }
  } catch (e) {
    console.error(`error: ${e instanceof Error ? e.message : e}`)
    process.exit(1)
  }
}
