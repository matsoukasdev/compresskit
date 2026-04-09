import { Connection, PublicKey } from '@solana/web3.js'

interface VerifyOpts {
  network: string
}

export async function verify(programId: string, opts: VerifyOpts) {
  const rpc = opts.network === 'mainnet'
    ? process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
    : process.env.DEVNET_RPC_URL || 'https://api.devnet.solana.com'

  console.log(`\nverifying compression for ${programId} on ${opts.network}...\n`)

  const conn = new Connection(rpc)

  try {
    const pubkey = new PublicKey(programId)
    const accounts = await conn.getProgramAccounts(pubkey, {
      dataSlice: { offset: 0, length: 0 },
    })

    const totalAccounts = accounts.length
    let totalRent = 0

    for (const acc of accounts) {
      totalRent += acc.account.lamports
    }

    console.log('verification report:')
    console.log('─'.repeat(50))
    console.log(`program:          ${programId}`)
    console.log(`network:          ${opts.network}`)
    console.log(`total accounts:   ${totalAccounts}`)
    console.log(`total rent held:  ${(totalRent / 1e9).toFixed(4)} SOL`)

    if (totalAccounts === 0) {
      console.log(`\nstatus: no uncompressed accounts found`)
      console.log('migration may be complete or program has no state')
    } else {
      console.log(`\nstatus: ${totalAccounts} uncompressed accounts remaining`)
      console.log('run `compresskit migrate` to generate migration plan')
    }

    console.log('─'.repeat(50))

  } catch (e) {
    console.error(`error: ${e instanceof Error ? e.message : e}`)
    process.exit(1)
  }
}
