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

# Compare regular vs compressed costs
compresskit cost <PROGRAM_ID>

# Generate migration plan
compresskit migrate <PROGRAM_ID> --output ./migration

# Verify migration status
compresskit verify <PROGRAM_ID>

# Scaffold a compressed project template
compresskit template loyalty --output ./my-project
```

## Options

All commands accept `-n, --network <devnet|mainnet>` (default: `devnet`).

## Stack

TypeScript CLI (commander.js) + Light Protocol SDK

## Dev

```bash
cd cli
npm install && npm run build
node dist/index.js analyze <PROGRAM_ID>
```

## License

MIT
