import { Connection, PublicKey } from '@solana/web3.js'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { calcCost } from '../core/cost-calc'
import { getRpcUrl } from '../core/rpc'
import { spinner, heading, info, divider, solValue, success, handleError } from '../core/output'

interface MigrateOpts {
  network: string
  output: string
}

interface GroupEntry {
  size: number
  count: number
  regularCost: number
  compressedCost: number
  savingsPct: number
}

function buildMigrationMd(programId: string, network: string, groups: GroupEntry[], totalSavings: number): string {
  const ts = new Date().toISOString().split('T')[0]
  const totalAccounts = groups.reduce((s, g) => s + g.count, 0)
  const totalRegular = groups.reduce((s, g) => s + g.regularCost, 0)
  const totalCompressed = groups.reduce((s, g) => s + g.compressedCost, 0)

  const sol = (lamports: number) => (lamports / 1e9).toFixed(4)

  let md = `# Migration Plan

**Program:** \`${programId}\`
**Network:** ${network}
**Generated:** ${ts}
**Accounts:** ${totalAccounts} across ${groups.length} group(s)

---

## Account Groups

| Group | Size (bytes) | Count | Rent (SOL) | Compressed (SOL) | Savings |
|-------|-------------|-------|------------|-------------------|---------|
`

  groups.forEach((g, i) => {
    md += `| ${i + 1} | ${g.size} | ${g.count} | ${sol(g.regularCost)} | ${sol(g.compressedCost)} | ${g.savingsPct}% |\n`
  })

  md += `| **Total** | | **${totalAccounts}** | **${sol(totalRegular)}** | **${sol(totalCompressed)}** | |

---

## Cost Comparison

| Metric | Regular | Compressed | Savings |
|--------|---------|------------|---------|
| Total Rent | ${sol(totalRegular)} SOL | ${sol(totalCompressed)} SOL | ${sol(totalSavings)} SOL |
| Per Account (avg) | ${sol(Math.round(totalRegular / totalAccounts))} SOL | ${sol(Math.round(totalCompressed / totalAccounts))} SOL | |

---

## Step-by-Step Migration

### 1. Install Dependencies

\`\`\`bash
cargo add light-sdk light-client light-hasher
npm install @lightprotocol/stateless.js @lightprotocol/compressed-token
\`\`\`

### 2. Create State Tree

Before migrating accounts you need a state tree on-chain:

\`\`\`rust
use light_sdk::merkle_context::MerkleContext;

// initialize a state tree for your program
// each tree can hold up to 2^26 compressed accounts
let tree = create_state_tree(
    &payer,
    ${groups.length > 1 ? groups.length : 1}, // number of trees based on account volume
)?;
\`\`\`

### 3. Update Account Structs

Replace standard Anchor accounts with compressed equivalents:

\`\`\`rust
use light_sdk::compressed_account::CompressedAccount;
use light_sdk::compressed_account::CompressedAccountData;

// before: regular Solana account
// #[account]
// pub struct MyState {
//     pub authority: Pubkey,
//     pub data: u64,
// }

// after: compressed account data
pub fn compress_account(
    authority: Pubkey,
    data: u64,
) -> CompressedAccountData {
    let mut buf = Vec::new();
    buf.extend_from_slice(authority.as_ref());
    buf.extend_from_slice(&data.to_le_bytes());

    CompressedAccountData {
        discriminator: [0u8; 8], // your account discriminator
        data: buf,
        data_hash: hash_account_data(&buf),
    }
}
\`\`\`

`

  groups.forEach((g, i) => {
    md += `### ${i + 4}. Migrate Group ${i + 1} — ${g.count} accounts (${g.size} bytes)

\`\`\`rust
use light_sdk::compressed_account::*;
use light_sdk::merkle_context::PackedMerkleContext;

pub fn migrate_group_${i + 1}(
    ctx: Context<MigrateAccounts>,
    merkle_context: PackedMerkleContext,
) -> Result<()> {
    // read existing account data (${g.size} bytes per account)
    let data = ctx.accounts.source_account.try_borrow_data()?;

    // create compressed account with same data
    let compressed = CompressedAccountData {
        discriminator: data[..8].try_into().unwrap(),
        data: data[8..].to_vec(),
        data_hash: hash_account_data(&data[8..]),
    };

    // write to state tree
    create_compressed_account(
        &ctx.accounts.light_system_program,
        &ctx.accounts.payer,
        &compressed,
        &merkle_context,
    )?;

    // close original account, reclaim ${sol(g.regularCost / g.count)} SOL rent per account
    close_account(ctx.accounts.source_account.to_account_info(), ctx.accounts.payer.to_account_info())?;

    Ok(())
}
\`\`\`

`
  })

  md += `---

## Client-Side Migration Script

\`\`\`typescript
import { Rpc, createRpc } from '@lightprotocol/stateless.js'

const rpc = createRpc(RPC_ENDPOINT, COMPRESSION_ENDPOINT)

// fetch all program accounts
const accounts = await connection.getProgramAccounts(new PublicKey('${programId}'))

// migrate in batches of 5 (tx size limit)
for (let i = 0; i < accounts.length; i += 5) {
  const batch = accounts.slice(i, i + 5)
  const tx = new Transaction()

  for (const acc of batch) {
    tx.add(
      await program.methods
        .migrateToCompressed()
        .accounts({ sourceAccount: acc.pubkey })
        .instruction()
    )
  }

  await sendAndConfirmTransaction(connection, tx, [payer])
  console.log(\`migrated \${Math.min(i + 5, accounts.length)}/\${accounts.length}\`)
}
\`\`\`

---

## Verification

After migration, verify compressed accounts match originals:

\`\`\`bash
compresskit verify ${programId} --network ${network}
\`\`\`

This checks:
- All original accounts have corresponding compressed entries
- Data hashes match between original and compressed
- State tree integrity is valid
- No orphaned accounts remain

---

## Rollback Plan

If issues arise during migration:

1. **Stop migration** — do not close remaining original accounts
2. **Verify partial state** — \`compresskit verify ${programId}\`
3. **Keep originals** — compressed accounts coexist with regular accounts
4. **Decompress if needed:**

\`\`\`rust
// read compressed account from state tree
let compressed = read_compressed_account(
    &rpc,
    &program_id,
    &account_hash,
)?;

// recreate standard account with same data
create_account_with_data(
    &payer,
    &compressed.data,
    program_id,
)?;
\`\`\`

5. **Full rollback** — original accounts still hold rent, no funds lost until \`close_account\` is called

---

*Generated by compresskit migrate*
`

  return md
}

export async function migrate(programId: string, opts: MigrateOpts) {
  const rpc = getRpcUrl(opts.network)

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
    const groups: GroupEntry[] = []

    for (const [sizeStr, count] of Object.entries(sizeGroups)) {
      const size = Number(sizeStr)
      const report = calcCost(size, count)
      totalSavings += report.regularCost - report.compressedCost

      groups.push({
        size,
        count,
        regularCost: report.regularCost,
        compressedCost: report.compressedCost,
        savingsPct: report.savingsPct,
      })

      info(`step ${step}`, `compress ${count} accounts (${size} bytes)`)
      info('  rent', solValue(report.regularCost))
      info('  compressed', solValue(report.compressedCost))
      info('  savings', `${report.savingsPct}%`)
      console.log('')
      step++
    }

    divider(40)
    info('total savings', solValue(totalSavings))

    // generate MIGRATION.md
    mkdirSync(opts.output, { recursive: true })
    const outPath = join(opts.output, 'MIGRATION.md')
    const md = buildMigrationMd(programId, opts.network, groups, totalSavings)
    writeFileSync(outPath, md, 'utf-8')

    info('output', outPath)
    success('migration plan written to MIGRATION.md')

  } catch (e) {
    spin.fail('migration planning failed')
    handleError(e)
  }
}
