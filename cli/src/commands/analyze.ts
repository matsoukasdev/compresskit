import { Connection } from '@solana/web3.js'

interface AnalyzeOpts {
  network: string
}

export async function analyze(programId: string, opts: AnalyzeOpts) {
  const rpc = opts.network === 'mainnet'
    ? process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
    : process.env.DEVNET_RPC_URL || 'https://api.devnet.solana.com'

  console.log(`\nanalyzing ${programId} on ${opts.network}...\n`)

  const conn = new Connection(rpc)

  // fetch program accounts
  try {
    const accounts = await conn.getProgramAccounts(
      // @ts-expect-error -- will validate in next phase
      programId,
      { dataSlice: { offset: 0, length: 0 } }
    )
    console.log(`found ${accounts.length} accounts`)
    console.log('detailed analysis coming soon')
  } catch (e) {
    console.error(`error: ${e instanceof Error ? e.message : e}`)
    process.exit(1)
  }
}
