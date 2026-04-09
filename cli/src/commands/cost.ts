import { Connection, PublicKey } from '@solana/web3.js'
import { calcCost } from '../core/cost-calc'

interface CostOpts {
  network: string
}

export async function cost(programId: string, opts: CostOpts) {
  const rpc = opts.network === 'mainnet'
    ? process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
    : process.env.DEVNET_RPC_URL || 'https://api.devnet.solana.com'

  console.log(`\ncost comparison for ${programId} on ${opts.network}\n`)

  const conn = new Connection(rpc)

  try {
    const pubkey = new PublicKey(programId)
    const accounts = await conn.getProgramAccounts(pubkey)

    if (accounts.length === 0) {
      console.log('no accounts found')
      return
    }

    // group by size for detailed breakdown
    const sizeGroups: Record<number, number> = {}
    for (const acc of accounts) {
      const size = acc.account.data.length
      sizeGroups[size] = (sizeGroups[size] || 0) + 1
    }

    let totalRegular = 0
    let totalCompressed = 0

    console.log('size (bytes)  count    regular rent     compressed      savings')
    console.log('─'.repeat(70))

    for (const [sizeStr, count] of Object.entries(sizeGroups)) {
      const size = Number(sizeStr)
      const report = calcCost(size, count)
      totalRegular += report.regularCost
      totalCompressed += report.compressedCost

      const reg = (report.regularCost / 1e9).toFixed(4).padStart(12)
      const comp = (report.compressedCost / 1e9).toFixed(4).padStart(12)
      console.log(
        `${String(size).padEnd(14)}${String(count).padEnd(9)}${reg} SOL  ${comp} SOL  ${report.savingsPct}%`
      )
    }

    console.log('─'.repeat(70))
    console.log(
      `total         ${String(accounts.length).padEnd(9)}${(totalRegular / 1e9).toFixed(4).padStart(12)} SOL  ${(totalCompressed / 1e9).toFixed(4).padStart(12)} SOL  ${Math.round((1 - totalCompressed / totalRegular) * 100)}%`
    )
    console.log(`\nyou save ${((totalRegular - totalCompressed) / 1e9).toFixed(4)} SOL with ZK compression`)

  } catch (e) {
    console.error(`error: ${e instanceof Error ? e.message : e}`)
    process.exit(1)
  }
}
