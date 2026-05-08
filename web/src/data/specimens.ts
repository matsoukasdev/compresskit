export type SpecimenId = 'analyze' | 'cost' | 'migrate' | 'template' | 'verify'

export type OutputLine =
  | { kind: 'text'; text: string; tone?: 'mute' | 'coral' | 'moss' | 'ink' }
  | { kind: 'kv'; key: string; value: string; tone?: 'mute' | 'coral' | 'moss' | 'ink' }
  | { kind: 'rule' }
  | { kind: 'row'; cells: string[]; tones?: Array<'mute' | 'coral' | 'moss' | 'ink' | undefined> }
  | { kind: 'head'; cells: string[] }
  | { kind: 'bullet'; text: string; icon?: '✓' | '⚠' | '•' }

export interface Specimen {
  id: SpecimenId
  index: string
  folio: string
  title: string
  tagline: string
  prose: string
  command: string
  heading: string
  output: OutputLine[]
  aside: { label: string; value: string }[]
}

export const specimens: Specimen[] = [
  {
    id: 'analyze',
    index: '01',
    folio: 'FOLIO I',
    title: 'Analyze',
    tagline: 'A first reading of a program on chain.',
    prose:
      'Point compresskit at any deployed program. It reads the IDL, scans every account owned by the program, and measures the rent you are paying to keep them on the ledger.',
    command: 'compresskit analyze TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    heading: 'compresskit analyze',
    output: [
      { kind: 'text', text: '- scanning on devnet…', tone: 'mute' },
      { kind: 'text', text: '✔ found 1,247 accounts', tone: 'moss' },
      { kind: 'rule' },
      { kind: 'kv', key: 'accounts', value: '1,247' },
      { kind: 'kv', key: 'size groups', value: '3' },
      { kind: 'kv', key: 'avg size', value: '165 bytes' },
      { kind: 'rule' },
      { kind: 'kv', key: 'estimated rent', value: '2.8910 SOL' },
      { kind: 'kv', key: 'compressed', value: '0.1446 SOL' },
      { kind: 'kv', key: 'savings', value: '95%', tone: 'coral' },
      { kind: 'bullet', text: "run 'compresskit cost …' for breakdown", icon: '✓' }
    ],
    aside: [
      { label: 'READS', value: 'Anchor IDL, RPC getProgramAccounts' },
      { label: 'EMITS', value: 'Analysis report (stdout)' },
      { label: 'NETWORK', value: 'devnet / mainnet' }
    ]
  },
  {
    id: 'cost',
    index: '02',
    folio: 'FOLIO II',
    title: 'Cost',
    tagline: 'A ledger of savings, group by group.',
    prose:
      'Where analyze gives a headline number, cost opens the books — a per-size-group comparison of what you pay now versus what you would pay compressed. Audit-ready output, no surprises.',
    command: 'compresskit cost TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    heading: 'compresskit cost — devnet',
    output: [
      { kind: 'text', text: '✔ 1,247 accounts loaded', tone: 'moss' },
      { kind: 'rule' },
      { kind: 'head', cells: ['size', 'count', 'regular', 'compressed', 'savings'] },
      { kind: 'row', cells: ['82 B', '312', '0.2900', '0.0145', '95%'], tones: [undefined, undefined, undefined, undefined, 'coral'] },
      { kind: 'row', cells: ['165 B', '890', '2.1040', '0.1052', '95%'], tones: [undefined, undefined, undefined, undefined, 'coral'] },
      { kind: 'row', cells: ['340 B', '45', '0.4970', '0.0249', '95%'], tones: [undefined, undefined, undefined, undefined, 'coral'] },
      { kind: 'rule' },
      { kind: 'row', cells: ['TOTAL', '1,247', '2.8910', '0.1446', '95%'], tones: ['ink', 'ink', 'ink', 'ink', 'coral'] },
      { kind: 'bullet', text: 'save 2.7464 SOL with ZK compression', icon: '✓' }
    ],
    aside: [
      { label: 'GROUPS BY', value: 'Account data size' },
      { label: 'UNIT', value: 'SOL at current rent' },
      { label: 'OUTPUT', value: 'Printed table + exit code' }
    ]
  },
  {
    id: 'migrate',
    index: '03',
    folio: 'FOLIO III',
    title: 'Migrate',
    tagline: 'A plan you can hand to an engineer.',
    prose:
      'This command never touches production. It assembles a step-by-step migration plan with Rust CPI snippets, a client-side batch script, rollback notes, and writes it to MIGRATION.md for review.',
    command: 'compresskit migrate 9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin --output ./migration',
    heading: 'compresskit migrate — devnet',
    output: [
      { kind: 'text', text: '✔ 48 accounts in 2 groups', tone: 'moss' },
      { kind: 'rule' },
      { kind: 'kv', key: 'step 1', value: 'compress 32 accounts (200 B)' },
      { kind: 'kv', key: '  rent', value: '0.0730 SOL' },
      { kind: 'kv', key: '  compressed', value: '0.0037 SOL' },
      { kind: 'kv', key: '  savings', value: '95%', tone: 'coral' },
      { kind: 'rule' },
      { kind: 'kv', key: 'step 2', value: 'compress 16 accounts (512 B)' },
      { kind: 'kv', key: '  rent', value: '0.0694 SOL' },
      { kind: 'kv', key: '  compressed', value: '0.0035 SOL' },
      { kind: 'kv', key: '  savings', value: '95%', tone: 'coral' },
      { kind: 'rule' },
      { kind: 'kv', key: 'total savings', value: '0.1352 SOL', tone: 'coral' },
      { kind: 'kv', key: 'output', value: './migration/MIGRATION.md' },
      { kind: 'bullet', text: 'migration plan written to MIGRATION.md', icon: '✓' }
    ],
    aside: [
      { label: 'WRITES', value: 'MIGRATION.md' },
      { label: 'CONTAINS', value: 'Rust CPI + TS client + rollback' },
      { label: 'EXECUTES', value: 'Nothing on chain' }
    ]
  },
  {
    id: 'template',
    index: '04',
    folio: 'FOLIO IV',
    title: 'Template',
    tagline: 'Three starters. Built for compression from line one.',
    prose:
      'Loyalty points. Gaming items. Social graphs. Each template is a complete Anchor program paired with a Light Protocol TypeScript client, ready to build and deploy.',
    command: 'compresskit template loyalty --output ./my-loyalty',
    heading: 'compresskit template — loyalty',
    output: [
      { kind: 'kv', key: 'type', value: 'Loyalty Program (points · tiers · redemption)' },
      { kind: 'kv', key: 'output', value: '/Users/dev/my-loyalty' },
      { kind: 'text', text: '- scaffolding project…', tone: 'mute' },
      { kind: 'text', text: '✔ 7 files created', tone: 'moss' },
      { kind: 'rule' },
      { kind: 'row', cells: ['Cargo.toml', 'programs/loyalty/Cargo.toml'] },
      { kind: 'row', cells: ['lib.rs', 'programs/loyalty/src/lib.rs'] },
      { kind: 'row', cells: ['package.json', 'app/package.json'] },
      { kind: 'row', cells: ['compress.ts', 'app/src/compress.ts'] },
      { kind: 'row', cells: ['Anchor.toml', 'Anchor.toml'] },
      { kind: 'row', cells: ['.env.example', '.env.example'] },
      { kind: 'row', cells: ['README.md', 'README.md'] },
      { kind: 'bullet', text: 'loyalty template ready at ./my-loyalty', icon: '✓' },
      { kind: 'kv', key: 'next steps', value: 'cd ./my-loyalty && anchor build' }
    ],
    aside: [
      { label: 'TYPES', value: 'loyalty · gaming · social' },
      { label: 'EMITS', value: '7 files per template' },
      { label: 'BUILDS WITH', value: 'anchor build' }
    ]
  },
  {
    id: 'verify',
    index: '05',
    folio: 'FOLIO V',
    title: 'Verify',
    tagline: 'A second read, after migration.',
    prose:
      'After a migration run, verify counts the accounts still living uncompressed on chain, totals the rent they still hold, and tells you what is left to do.',
    command: 'compresskit verify 9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
    heading: 'compresskit verify — devnet',
    output: [
      { kind: 'text', text: '✔ verification complete', tone: 'moss' },
      { kind: 'rule' },
      { kind: 'kv', key: 'program', value: '9xQeWv…VFin' },
      { kind: 'kv', key: 'network', value: 'devnet' },
      { kind: 'kv', key: 'accounts', value: '12' },
      { kind: 'kv', key: 'rent held', value: '0.0182 SOL' },
      { kind: 'rule' },
      { kind: 'bullet', text: '12 uncompressed accounts remaining', icon: '⚠' },
      { kind: 'kv', key: 'next step', value: "run 'compresskit migrate' to generate plan" }
    ],
    aside: [
      { label: 'READS', value: 'RPC + program accounts' },
      { label: 'NO WRITES', value: 'Pure check' },
      { label: 'RETURNS', value: 'Exit 0 / 1' }
    ]
  }
]

export const ledgerFigures = [
  { big: '95%', label: 'typical rent reduction', note: 'across the three size groups we measured.' },
  { big: '5', label: 'commands', note: 'analyze · cost · migrate · template · verify.' },
  { big: '3', label: 'production templates', note: 'loyalty, gaming, and social — scaffolded in one command.' },
  { big: '∅', label: 'programs to deploy', note: 'compresskit is a CLI. Your chain stays untouched.' }
]

export const kits = [
  {
    code: 'LY',
    name: 'Loyalty',
    lede: 'Points, tiers, redemptions.',
    pieces: ['Program: mint, accrue, spend', 'Client: compressed balance read', 'Guide: retailer onboarding'],
    hue: 'coral'
  },
  {
    code: 'GM',
    name: 'Gaming',
    lede: 'Scores, items, achievements.',
    pieces: ['Program: item registry', 'Client: batched state sync', 'Guide: MMO inventory pattern'],
    hue: 'moss'
  },
  {
    code: 'SO',
    name: 'Social',
    lede: 'Followers, posts, graphs.',
    pieces: ['Program: follow edges + posts', 'Client: graph traversal', 'Guide: handling feed fan-out'],
    hue: 'plum'
  }
] as const
