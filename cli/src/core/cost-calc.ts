const RENT_PER_BYTE = 6960 // lamports
const COMPRESSED_COST_FACTOR = 0.05 // ~95% savings

export interface CostReport {
  regularCost: number
  compressedCost: number
  savingsPct: number
}

export function calcCost(accountSize: number, count: number): CostReport {
  const regular = (accountSize + 128) * RENT_PER_BYTE * count
  const compressed = regular * COMPRESSED_COST_FACTOR

  return {
    regularCost: regular,
    compressedCost: Math.ceil(compressed),
    savingsPct: Math.round((1 - COMPRESSED_COST_FACTOR) * 100),
  }
}
