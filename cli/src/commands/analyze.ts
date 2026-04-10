import { Connection, PublicKey } from '@solana/web3.js'
import { calcCost } from '../core/cost-calc'
import { spinner, heading, info, success, divider, solValue, savingsHighlight, handleError } from '../core/output'

interface AnalyzeOpts {
  network: string
}

export async function analyze(programId: string, opts: AnalyzeOpts) {
  const rpc = opts.network === 'mainnet'
    ? process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
    : process.env.DEVNET_RPC_URL || 'https://api.devnet.solana.com'

  await heading(`compresskit analyze`)

  const spin = await spinner(`scanning ${programId} on ${opts.network}...`)
  spin.start()

  try {
    const pubkey = new PublicKey(programId)
    const conn = new Connection(rpc)
    const accounts = await conn.getProgramAccounts(pubkey)

    spin.succeed(`found ${accounts.length} accounts`)

    if (accounts.length === 0) {
      await info('status', 'no accounts — nothing to compress')
      return
    }

    const sizeGroups: Record<number, number> = {}
    let totalSize = 0
    for (const acc of accounts) {
      const size = acc.account.data.length
      sizeGroups[size] = (sizeGroups[size] || 0) + 1
      totalSize += size
    }

    const avgSize = Math.round(totalSize / accounts.length)
    const report = calcCost(avgSize, accounts.length)

    console.log('')
    await info('accounts', accounts.length)
    await info('size groups', Object.keys(sizeGroups).length)
    await info('avg size', `${avgSize} bytes`)
    await divider(40)
    await info('estimated rent', await solValue(report.regularCost))
    await info('compressed', await solValue(report.compressedCost))
    await info('savings', await savingsHighlight(report.savingsPct))
    await success(`run 'compresskit cost ${programId}' for breakdown`)

  } catch (e) {
    spin.fail('analysis failed')
    handleError(e)
  }
}
