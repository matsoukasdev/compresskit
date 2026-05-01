# changelog

all notable changes to compresskit cli.

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
