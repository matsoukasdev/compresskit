import { Connection, PublicKey } from '@solana/web3.js'
import { calcCost } from '../core/cost-calc'
import { getRpcUrl } from '../core/rpc'
import { spinner, heading, tableHeader, tableRow, divider, solValue, savingsHighlight, success, handleError } from '../core/output'

interface CostOpts {
  network: string
}

export async function cost(programId: string, opts: CostOpts) {
  const rpc = getRpcUrl(opts.network)

  heading(`compresskit cost — ${opts.network}`)

  const spin = spinner(`loading accounts for ${programId}...`)
  spin.start()

  try {
    const pubkey = new PublicKey(programId)
    const conn = new Connection(rpc)
    const accounts = await conn.getProgramAccounts(pubkey)

    if (accounts.length === 0) {
      spin.info('no accounts found')
      return
    }

    spin.succeed(`${accounts.length} accounts loaded`)

    const sizeGroups: Record<number, number> = {}
    for (const acc of accounts) {
      const size = acc.account.data.length
      sizeGroups[size] = (sizeGroups[size] || 0) + 1
    }

    const cols = ['size', 'count', 'regular', 'compressed', 'savings']
    const widths = [12, 8, 16, 16, 10]

    console.log('')
    tableHeader(cols, widths)

    let totalRegular = 0
    let totalCompressed = 0

    for (const [sizeStr, count] of Object.entries(sizeGroups)) {
      const size = Number(sizeStr)
      const report = calcCost(size, count)
      totalRegular += report.regularCost
      totalCompressed += report.compressedCost

      tableRow(
        [
          `${size} B`,
          String(count),
          solValue(report.regularCost),
          solValue(report.compressedCost),
          `${report.savingsPct}%`,
        ],
        widths,
        [4]
      )
    }

    divider(widths.reduce((a, b) => a + b, 0))

    const totalPct = totalRegular > 0
      ? Math.round((1 - totalCompressed / totalRegular) * 100)
      : 0

    tableRow(
      [
        'TOTAL',
        String(accounts.length),
        solValue(totalRegular),
        solValue(totalCompressed),
        savingsHighlight(totalPct),
      ],
      widths,
      [4]
    )

    success(`save ${solValue(totalRegular - totalCompressed)} with ZK compression`)

  } catch (e) {
    spin.fail('cost analysis failed')
    handleError(e)
  }
}
