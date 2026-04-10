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

  Program Analysis: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA

  Accounts found:    1,247
  Average size:      165 bytes
  Total rent held:   2.891 SOL

  Size Distribution:
  ┌──────────┬───────┬────────────┐
  │ Size     │ Count │ Rent (SOL) │
  ├──────────┼───────┼────────────┤
  │ 0-128 B  │   312 │     0.290  │
  │ 128-256  │   890 │     2.104  │
  │ 256-512  │    45 │     0.497  │
  └──────────┴───────┴────────────┘

  Compression savings: ~95% rent reduction
```

### `compresskit cost <PROGRAM_ID>`

Side-by-side cost comparison.

```
$ compresskit cost TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA

  Cost Comparison
  ┌──────────┬───────┬──────────────┬──────────────┬─────────┐
  │ Size     │ Count │ Regular (SOL)│ Compressed   │ Savings │
  ├──────────┼───────┼──────────────┼──────────────┼─────────┤
  │ 0-128 B  │   312 │       0.290  │       0.015  │   95.0% │
  │ 128-256  │   890 │       2.104  │       0.105  │   95.0% │
  │ 256-512  │    45 │       0.497  │       0.025  │   95.0% │
  ├──────────┼───────┼──────────────┼──────────────┼─────────┤
  │ TOTAL    │ 1,247 │       2.891  │       0.145  │   95.0% │
  └──────────┴───────┴──────────────┴──────────────┴─────────┘
```

### `compresskit migrate <PROGRAM_ID> [--output ./dir]`

Generate a step-by-step migration plan.

### `compresskit verify <PROGRAM_ID>`

Check how many uncompressed accounts remain after migration.

### `compresskit template <type> [--output ./dir]`

Scaffold a new project with compression built in. Types: `loyalty`, `gaming`, `social`.

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
