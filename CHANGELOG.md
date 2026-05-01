# changelog

all notable changes to compresskit cli.

## [unreleased]

### added
- error code reference at cli/docs/error-codes.md (12 stable codes 100-200)
- sample loyalty IDL at cli/samples/idl.json for parser smoke tests
- analyze --json output mode

### changed
- help text widened to 100 chars for nicer column alignment
- analyze emits 200 exit on success (was 0) to match new error-code scheme

## [0.1.0] — first publish

- npm publish under `@dominator/compresskit`
- 5 commands: `analyze`, `cost`, `migrate`, `template`, `verify`
- 3 templates: loyalty, gaming, social — via `compresskit template <name>`
- `migrate` generates `MIGRATION.md` with cost report + step list
- idl parser with defined-type fallback
- output utils: chalk tables + ora spinners on every command
- rpc hints + pubkey guard upfront
- network validation (devnet vs mainnet rent calc)
- try-catch around template I/O + shared `getRpcUrl`
- README with all 5 commands + output examples
- removed `dist/` from tracking, untracked tsbuildinfo
- web companion site as a specimen landing page
