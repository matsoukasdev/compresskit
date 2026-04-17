/**
 * Shared RPC URL resolution + program id parsing for network commands.
 */

import { PublicKey } from '@solana/web3.js'

export function getRpcUrl(network: string): string {
  return network === 'mainnet'
    ? process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
    : process.env.DEVNET_RPC_URL || 'https://api.devnet.solana.com'
}

export function parseProgramId(id: string): PublicKey {
  try {
    return new PublicKey(id)
  } catch {
    console.error(
      '\n  error: invalid program ID — must be a base58 Solana address'
    )
    process.exit(1)
  }
}
