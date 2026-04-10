import { Connection, PublicKey } from '@solana/web3.js'
import { spinner, heading, info, divider, solValue, success, warn, handleError } from '../core/output'

interface VerifyOpts {
  network: string
}

export async function verify(programId: string, opts: VerifyOpts) {
  const rpc = opts.network === 'mainnet'
    ? process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
    : process.env.DEVNET_RPC_URL || 'https://api.devnet.solana.com'

  await heading(`compresskit verify — ${opts.network}`)

  const spin = await spinner(`checking ${programId}...`)
  spin.start()

  try {
    const pubkey = new PublicKey(programId)
    const conn = new Connection(rpc)
    const accounts = await conn.getProgramAccounts(pubkey, {
      dataSlice: { offset: 0, length: 0 },
    })

    const totalAccounts = accounts.length
    let totalRent = 0
    for (const acc of accounts) {
      totalRent += acc.account.lamports
    }

    spin.succeed('verification complete')

    console.log('')
    await info('program', programId)
    await info('network', opts.network)
    await info('accounts', totalAccounts)
    await info('rent held', await solValue(totalRent))
    await divider(40)

    if (totalAccounts === 0) {
      await success('no uncompressed accounts — migration may be complete')
    } else {
      await warn(`${totalAccounts} uncompressed accounts remaining`)
      await info('next step', "run 'compresskit migrate' to generate plan")
    }

  } catch (e) {
    spin.fail('verification failed')
    handleError(e)
  }
}
