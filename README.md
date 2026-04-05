# compresskit

CLI toolkit for migrating Solana programs to ZK Compression.

## Install

```bash
npm install -g compresskit
```

## Usage

```bash
# Analyze a program for compression opportunities
compresskit analyze <PROGRAM_ID>

# Output
┌──────────────────────────────────┐
│ CompressKit Analysis Report      │
├──────────────┬───────────────────┤
│ Accounts     │ 1,247             │
│ Total Size   │ 892 KB            │
│ Compressed   │ ~31 KB (96% save) │
│ Annual Cost  │ 2.1 → 0.07 SOL   │
└──────────────┴───────────────────┘

# Generate migration
compresskit migrate <PROGRAM_ID> --out ./migration

# Estimate costs
compresskit cost <PROGRAM_ID>
```

## Stack

TypeScript CLI (commander.js) + Light Protocol SDK

## Dev

```bash
npm install && npm run build
node bin/compresskit.js analyze <PROGRAM_ID>
```

## License

MIT
