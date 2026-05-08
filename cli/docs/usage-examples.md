# usage examples

a small cookbook for compresskit. each example is a shell session you can paste.

## quick analyze

```sh
$ compresskit analyze --program 5mnqN7onSgqy9tBCTJ46N2mGr4Ty68fvCg4HqK5TsdTo
analyzing program... ✓
  accounts:        4 distinct shapes
  candidates:      3 of 4 (75% storage savings projected)
  estimated cost:  0.0042 SOL → 0.00021 SOL
  next:            run `compresskit migrate` to scaffold migration
```

## analyze + json output

```sh
$ compresskit analyze --program <PROGRAM_ID> --json | jq .
{
  "ok": true,
  "program": "5mnqN7on...",
  "accounts": [...],
  "candidates": 3,
  "estimated_savings_pct": 0.948
}
```

## scaffold a loyalty template

```sh
$ compresskit template loyalty --name my-rewards
✓ wrote my-rewards/
  ├── programs/loyalty/src/lib.rs
  ├── tests/loyalty.spec.ts
  ├── migrations/01_init.ts
  └── README.md
next: cd my-rewards && anchor build
```

## migrate an existing program

```sh
$ compresskit migrate --program <PROGRAM_ID>
generating migration plan... ✓
  step 1: deploy compressed-account scaffolding
  step 2: backfill from existing accounts
  step 3: switch frontend reads
  step 4: cutover writes (one-way)
written → MIGRATION.md
```

## cost calc (with USD)

```sh
$ compresskit cost --bytes 8192 --usd
8192 bytes
  uncompressed rent:   0.05716 SOL  (~$5.71)
  compressed cost:     0.00214 SOL  (~$0.21)
  savings:             96.3%
```

## using a custom RPC

```sh
$ COMPRESSKIT_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY \
    compresskit analyze --program <PROGRAM_ID>
```

## piping into CI

```sh
$ compresskit analyze --program <PROGRAM_ID> --json > out.json
$ jq -e ".candidates > 0" out.json && echo "compression worth pursuing"
```
