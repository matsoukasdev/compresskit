import { Connection, PublicKey } from '@solana/web3.js'
import { calcCost } from '../core/cost-calc'
import { spinner, heading, info, divider, solValue, success, warn, handleError } from '../core/output'

interface MigrateOpts {
  network: string
  output: string
}

export async function migrate(programId: string, opts: MigrateOpts) {
  const rpc = opts.network === 'mainnet'
    ? process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
    : process.env.DEVNET_RPC_URL || 'https://api.devnet.solana.com'

  heading(`compresskit migrate — ${opts.network}`)

  const spin = spinner(`scanning ${programId}...`)
  spin.start()

  try {
    const pubkey = new PublicKey(programId)
    const conn = new Connection(rpc)
    const accounts = await conn.getProgramAccounts(pubkey)

    if (accounts.length === 0) {
      spin.info('no accounts found for this program')
      return
    }

    const sizeGroups: Record<number, number> = {}
    for (const acc of accounts) {
      const size = acc.account.data.length
      sizeGroups[size] = (sizeGroups[size] || 0) + 1
    }

    spin.succeed(`${accounts.length} accounts in ${Object.keys(sizeGroups).length} groups`)

    console.log('')
    let totalSavings = 0
    let step = 1

    for (const [sizeStr, count] of Object.entries(sizeGroups)) {
      const size = Number(sizeStr)
      const report = calcCost(size, count)
      totalSavings += report.regularCost - report.compressedCost

      info(`step ${step}`, `compress ${count} accounts (${size} bytes)`)
      info('  rent', solValue(report.regularCost))
      info('  compressed', solValue(report.compressedCost))
      info('  savings', `${report.savingsPct}%`)
      console.log('')
      step++
    }

    divider(40)
    info('total savings', solValue(totalSavings))
    info('output dir', opts.output)
    warn('code generation coming in next release')
    success('migration plan generated')

  } catch (e) {
    spin.fail('migration planning failed')
    handleError(e)
  }
}
