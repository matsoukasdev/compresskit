export interface ParsedAccount {
  name: string
  size: number
  fields: string[]
}

export function parseIdl(_idl: unknown): ParsedAccount[] {
  // parse anchor IDL into account schemas
  return []
}
