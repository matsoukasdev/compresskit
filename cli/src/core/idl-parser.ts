import { readFileSync } from 'fs'

export interface ParsedAccount {
  name: string
  size: number
  fields: string[]
}

const TYPE_SIZES: Record<string, number> = {
  publicKey: 32, pubkey: 32,
  u8: 1, i8: 1, bool: 1,
  u16: 2, i16: 2,
  u32: 4, i32: 4, f32: 4,
  u64: 8, i64: 8, f64: 8,
  u128: 16, i128: 16,
}

function fieldSize(typ: unknown): number {
  if (typeof typ === 'string') return TYPE_SIZES[typ] ?? 0

  if (typeof typ === 'object' && typ !== null) {
    const t = typ as Record<string, unknown>

    if (t.defined) return 32
    if (t.option) return 1 + fieldSize(t.option)

    if (t.vec) {
      const inner = fieldSize(t.vec)
      return 4 + inner * 10
    }

    if (t.array) {
      const [innerTyp, len] = t.array as [unknown, number]
      return fieldSize(innerTyp) * (len || 0)
    }

    if (typeof t.kind === 'string' && t.kind === 'struct' && Array.isArray(t.fields)) {
      return (t.fields as unknown[]).reduce<number>((sum, f) => {
        const fld = f as Record<string, unknown>
        return sum + fieldSize(fld.type)
      }, 0)
    }
  }

  return 0
}

function fieldLabel(name: string, typ: unknown): string {
  if (typeof typ === 'string') return `${name}: ${typ}`

  if (typeof typ === 'object' && typ !== null) {
    const t = typ as Record<string, unknown>
    if (t.option) return `${name}: Option<${typeStr(t.option)}>`
    if (t.vec) return `${name}: Vec<${typeStr(t.vec)}>`
    if (t.array) {
      const [inner, len] = t.array as [unknown, number]
      return `${name}: [${typeStr(inner)}; ${len}]`
    }
    if (t.defined) return `${name}: ${t.defined}`
  }

  return `${name}: unknown`
}

function typeStr(typ: unknown): string {
  if (typeof typ === 'string') return typ
  if (typeof typ === 'object' && typ !== null) {
    const t = typ as Record<string, unknown>
    if (t.defined) return String(t.defined)
    if (t.vec) return `Vec<${typeStr(t.vec)}>`
    if (t.option) return `Option<${typeStr(t.option)}>`
  }
  return 'unknown'
}

export function parseIdl(idl: unknown): ParsedAccount[] {
  try {
    if (!idl || typeof idl !== 'object') return []

    const root = idl as Record<string, unknown>
    const accs = root.accounts
    if (!Array.isArray(accs)) return []

    const result: ParsedAccount[] = []

    for (const acc of accs) {
      if (!acc || typeof acc !== 'object') continue
      const a = acc as Record<string, unknown>
      const name = typeof a.name === 'string' ? a.name : ''
      if (!name) continue

      const typ = a.type as Record<string, unknown> | undefined
      if (!typ || typ.kind !== 'struct' || !Array.isArray(typ.fields)) continue

      const fields: string[] = []
      let size = 8 // discriminator

      for (const f of typ.fields) {
        if (!f || typeof f !== 'object') continue
        const fld = f as Record<string, unknown>
        const fName = typeof fld.name === 'string' ? fld.name : '?'
        fields.push(fieldLabel(fName, fld.type))
        size += fieldSize(fld.type)
      }

      result.push({ name, size, fields })
    }

    return result
  } catch {
    return []
  }
}

export function loadIdl(path: string): ParsedAccount[] {
  try {
    const raw = readFileSync(path, 'utf-8')
    const idl = JSON.parse(raw)
    return parseIdl(idl)
  } catch {
    return []
  }
}
