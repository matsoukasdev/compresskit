import { Connection, PublicKey } from '@solana/web3.js'
import { getRpcUrl } from '../core/rpc'
import { spinner, heading, info, divider, solValue, success, warn, handleError } from '../core/output'

interface VerifyOpts {
  network: string
}

export async function verify(programId: string, opts: VerifyOpts) {
  const rpc = getRpcUrl(opts.network)

  heading(`compresskit verify — ${opts.network}`)

  const spin = spinner(`checking ${programId}...`)
  spin.start()

  try {
    const pubkey = new PublicKey(programId)
    const conn = new Connection(rpc)
    const accounts = await conn.getProgramAccounts(pubkey)

    const totalAccounts = accounts.length
    let totalRent = 0
    for (const acc of accounts) {
      totalRent += acc.account.lamports
    }

    spin.succeed('verification complete')

    console.log('')
    info('program', programId)
    info('network', opts.network)
    info('accounts', totalAccounts)
    info('rent held', solValue(totalRent))
    divider(40)

    if (totalAccounts === 0) {
      success('no uncompressed accounts — migration may be complete')
    } else {
      warn(`${totalAccounts} uncompressed accounts remaining`)
      info('next step', "run 'compresskit migrate' to generate plan")
    }

  } catch (e) {
    spin.fail('verification failed')
    handleError(e)
  }
}
