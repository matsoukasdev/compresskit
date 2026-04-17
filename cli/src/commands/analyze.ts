import { Connection } from '@solana/web3.js'
import { calcCost } from '../core/cost-calc'
import { getRpcUrl, parseProgramId } from '../core/rpc'
import { spinner, heading, info, success, divider, solValue, savingsHighlight, handleError } from '../core/output'

interface AnalyzeOpts {
  network: string
}

export async function analyze(programId: string, opts: AnalyzeOpts) {
  heading(`compresskit analyze`)

  const pubkey = parseProgramId(programId)
  const rpc = getRpcUrl(opts.network)

  const spin = spinner(`scanning ${programId} on ${opts.network}...`)
  spin.start()

  try {
    const conn = new Connection(rpc)
    const accounts = await conn.getProgramAccounts(pubkey)

    spin.succeed(`found ${accounts.length} accounts`)

    if (accounts.length === 0) {
      info('status', 'no accounts — nothing to compress')
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
    info('accounts', accounts.length)
    info('size groups', Object.keys(sizeGroups).length)
    info('avg size', `${avgSize} bytes`)
    divider(40)
    info('estimated rent', solValue(report.regularCost))
    info('compressed', solValue(report.compressedCost))
    info('savings', savingsHighlight(report.savingsPct))
    success(`run 'compresskit cost ${programId}' for breakdown`)

  } catch (e) {
    spin.fail('analysis failed')
    handleError(e)
  }
}
