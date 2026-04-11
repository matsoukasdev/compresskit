/**
 * Shared RPC URL resolution for all network-aware commands.
 */

export function getRpcUrl(network: string): string {
  return network === 'mainnet'
    ? process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
    : process.env.DEVNET_RPC_URL || 'https://api.devnet.solana.com'
}
