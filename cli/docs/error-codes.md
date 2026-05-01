# Error codes

Compresskit prints a numeric code for every error so CI scripts can branch
deterministically. Codes are stable across the 0.x line.

## Codes

| code | name                   | meaning                                                    |
|-----:|------------------------|-------------------------------------------------------------|
|  100 | `bad-rpc-url`          | RPC_URL env var missing or malformed                       |
|  101 | `rpc-unreachable`      | network call to RPC failed after 3 retries                 |
|  102 | `rpc-rate-limit`       | upstream RPC returned 429 — try a paid endpoint            |
|  110 | `bad-pubkey`           | argument was not a valid base58 public key                 |
|  111 | `idl-missing`          | requested IDL not found at the given path or program       |
|  112 | `idl-malformed`        | IDL JSON does not parse or fails schema validation         |
|  120 | `template-unknown`     | scaffold template not recognized                           |
|  121 | `template-overwrite`   | refusing to overwrite without `--force`                    |
|  130 | `migrate-no-changes`   | analyzer found nothing eligible for compression            |
|  131 | `migrate-conflict`     | account graph contains incompatible mutations              |
|  140 | `cost-fetch-fail`      | could not fetch SOL spot price for `--usd` mode            |
|  200 | `internal`             | bug in compresskit — please open an issue                  |

## Output

Errors are written to **stderr** with this shape:

```
✗ E101 rpc-unreachable
  network call failed after 3 retries
  hint: check RPC_URL or pass --rpc <url>
```

Exit code = the numeric error code (so `$?` matches).

## In `--json` mode

```json
{
  "ok": false,
  "error": {
    "code": 101,
    "name": "rpc-unreachable",
    "message": "network call failed after 3 retries",
    "hint": "check RPC_URL or pass --rpc <url>"
  }
}
```

## Reporting bugs

If you hit `E200`, please include the full stderr (sanitized of secrets) and
the command line that triggered it.
