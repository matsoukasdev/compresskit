# compresskit

CLI toolkit for migrating Solana programs to ZK Compression.

## Install

```bash
npm install -g compresskit
```

## Commands

### `compresskit analyze <PROGRAM_ID>`

Scan a program for compression opportunities.

```
$ compresskit analyze TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA

compresskit analyze

✔ found 1,247 accounts

  accounts          1247
  size groups       3
  avg size          165 bytes
  ────────────────────────────────────────
  estimated rent    2.8910 SOL
  compressed        0.1446 SOL
  savings           95%

  ✓ run 'compresskit cost TokenkegQfe...' for breakdown
```

### `compresskit cost <PROGRAM_ID>`

Side-by-side cost comparison per account group.

```
$ compresskit cost TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA

compresskit cost — devnet

✔ 1247 accounts loaded

  size        count   regular         compressed      savings
  ──────────────────────────────────────────────────────────────
  82 B        312     0.2900 SOL      0.0145 SOL      95%
  165 B       890     2.1040 SOL      0.1052 SOL      95%
  340 B       45      0.4970 SOL      0.0249 SOL      95%
  ──────────────────────────────────────────────────────────────
  TOTAL       1247    2.8910 SOL      0.1446 SOL      95%

  ✓ save 2.7464 SOL with ZK compression
```

### `compresskit migrate <PROGRAM_ID> [--output ./dir]`

Generate a migration plan + MIGRATION.md with step-by-step instructions.

```
$ compresskit migrate 9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin --output ./migration

compresskit migrate — devnet

✔ 48 accounts in 2 groups

  step 1            compress 32 accounts (200 bytes)
    rent            0.0730 SOL
    compressed      0.0037 SOL
    savings         95%

  step 2            compress 16 accounts (512 bytes)
    rent            0.0694 SOL
    compressed      0.0035 SOL
    savings         95%

  ────────────────────────────────────────
  total savings     0.1352 SOL
  output            ./migration/MIGRATION.md

  ✓ migration plan written to MIGRATION.md
```

The generated `MIGRATION.md` includes:
- Account groups table
- Cost comparison
- Rust migration code (Light Protocol SDK)
- Client-side migration script
- Verification + rollback plan

### `compresskit verify <PROGRAM_ID>`

Check remaining uncompressed accounts after migration.

```
$ compresskit verify 9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin

compresskit verify — devnet

✔ verification complete

  program           9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin
  network           devnet
  accounts          12
  rent held         0.0182 SOL
  ────────────────────────────────────────
  ⚠ 12 uncompressed accounts remaining
  next step         run 'compresskit migrate' to generate plan
```

### `compresskit template <type> [--output ./dir]`

Scaffold a new project with compression built in.

```
$ compresskit template loyalty --output ./my-loyalty

compresskit template — loyalty

  type              Loyalty Program (points, tiers, redemption)
  output            /Users/dev/my-loyalty
✔ 7 files created

        Cargo.toml  programs/loyalty/Cargo.toml
          lib.rs    programs/loyalty/src/lib.rs
      package.json  app/package.json
        compress.ts app/src/compress.ts
    Anchor.toml     Anchor.toml
    .env.example    .env.example
    README.md       README.md

  ✓ loyalty template ready at /Users/dev/my-loyalty
  next steps        cd ./my-loyalty && anchor build
```

Templates: `loyalty` (points/tiers), `gaming` (scores/achievements), `social` (followers/posts).

Each template includes:
- Anchor program with compressed account patterns
- TypeScript client with Light Protocol SDK integration
- Anchor.toml + .env.example + README

## Options

All commands accept `-n, --network <devnet|mainnet>` (default: `devnet`).

## Stack

TypeScript CLI built with commander.js, chalk, and ora.

## Dev

```bash
cd cli
npm install
npm run build
node dist/index.js analyze <PROGRAM_ID>
```

## License

MIT
