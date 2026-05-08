/**
 * Template data for scaffold command — loyalty, gaming, social.
 * Each template = Anchor program + TS client + config files.
 */

export interface TemplateFile {
  path: string
  content: string
}

export type TemplateType = 'loyalty' | 'gaming' | 'social'

// ── shared files (all templates) ──────────────────────────

function anchorToml(programName: string): string {
  return `[features]
seeds = false
skip-lint = false

[programs.devnet]
${programName} = "YOUR_PROGRAM_ID"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
`
}

function envExample(): string {
  return `# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
ANCHOR_WALLET=~/.config/solana/id.json

# Light Protocol (ZK Compression)
LIGHT_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
COMPRESSION_PROGRAM_ID=compr6CUsB5m2jS4Y3831ztGSTnDpnKJTKS95d64XVQ
`
}

function appPkgJson(name: string): string {
  return `{
  "name": "${name}-client",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "tsc",
    "start": "ts-node src/compress.ts"
  },
  "dependencies": {
    "@coral-xyz/anchor": "^0.29.0",
    "@lightprotocol/compressed-token": "^0.5.0",
    "@lightprotocol/stateless.js": "^0.5.0",
    "@solana/web3.js": "^1.87.0",
    "dotenv": "^16.3.0"
  },
  "devDependencies": {
    "ts-node": "^10.9.0",
    "typescript": "^5.3.0"
  }
}
`
}

function cargoToml(programName: string): string {
  return `[package]
name = "${programName}"
version = "0.1.0"
description = "ZK Compressed ${programName} — built with CompressKit"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]
name = "${programName}"

[features]
no-entrypoint = []
no-idl = []
no-log-ix-name = []
cpi = ["no-entrypoint"]
default = []

[dependencies]
anchor-lang = "0.29.0"
# light-sdk = "0.5.0"           # uncomment for ZK Compression
# light-compressed-token = "0.5.0"
`
}

// ── loyalty template ──────────────────────────────────────

function loyaltyLib(): string {
  return `use anchor_lang::prelude::*;

declare_id!("YOUR_PROGRAM_ID");

// ZK Compression: swap Account<'info, T> for CompressedAccount<T>
// when migrating to Light Protocol SDK

#[program]
pub mod loyalty {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let acct = &mut ctx.accounts.loyalty_account;
        acct.owner = ctx.accounts.owner.key();
        acct.points = 0;
        acct.tier = 0;
        acct.last_activity = Clock::get()?.unix_timestamp;
        acct.bump = ctx.bumps.loyalty_account;
        Ok(())
    }

    pub fn add_points(ctx: Context<UpdateLoyalty>, amount: u64) -> Result<()> {
        let acct = &mut ctx.accounts.loyalty_account;
        acct.points = acct.points.checked_add(amount).ok_or(ErrorCode::MathOverflow)?;
        acct.last_activity = Clock::get()?.unix_timestamp;

        // tier thresholds: 0=bronze, 1=silver, 2=gold, 3=platinum
        acct.tier = match acct.points {
            0..=999 => 0,
            1000..=4999 => 1,
            5000..=19999 => 2,
            _ => 3,
        };

        Ok(())
    }

    pub fn redeem_points(ctx: Context<UpdateLoyalty>, amount: u64) -> Result<()> {
        let acct = &mut ctx.accounts.loyalty_account;
        require!(acct.points >= amount, ErrorCode::InsufficientPoints);
        acct.points = acct.points.checked_sub(amount).ok_or(ErrorCode::MathOverflow)?;
        acct.last_activity = Clock::get()?.unix_timestamp;
        Ok(())
    }
}

// ── accounts ──────────────────────────────────────────────

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + LoyaltyAccount::INIT_SPACE,
        seeds = [b"loyalty", owner.key().as_ref()],
        bump,
    )]
    pub loyalty_account: Account<'info, LoyaltyAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateLoyalty<'info> {
    #[account(
        mut,
        seeds = [b"loyalty", owner.key().as_ref()],
        bump = loyalty_account.bump,
        constraint = loyalty_account.owner == owner.key() @ ErrorCode::Unauthorized,
    )]
    pub loyalty_account: Account<'info, LoyaltyAccount>,
    pub owner: Signer<'info>,
}

// ── state ─────────────────────────────────────────────────
// With ZK Compression this struct becomes a compressed account:
// ~95% rent savings at scale (1M+ accounts)

#[account]
#[derive(InitSpace)]
pub struct LoyaltyAccount {
    pub owner: Pubkey,       // 32
    pub points: u64,         // 8
    pub tier: u8,            // 1
    pub last_activity: i64,  // 8
    pub bump: u8,            // 1
}

// ── errors ────────────────────────────────────────────────

#[error_code]
pub enum ErrorCode {
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Insufficient points for redemption")]
    InsufficientPoints,
    #[msg("Unauthorized: signer is not the account owner")]
    Unauthorized,
}
`
}

function loyaltyClient(): string {
  return `import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import {
  LightSystemProgram,
  buildAndSignTx,
  createRpc,
  defaultTestStateTreeAccounts,
  sendAndConfirmTx,
} from "@lightprotocol/stateless.js";
import dotenv from "dotenv";

dotenv.config();

// ZK Compression helpers for loyalty accounts
// Uses Light Protocol SDK to create compressed PDAs

const RPC_URL = process.env.LIGHT_RPC_URL || "https://api.devnet.solana.com";

interface LoyaltyState {
  owner: PublicKey;
  points: number;
  tier: number;
  lastActivity: number;
}

/**
 * Create compressed loyalty account via Light Protocol.
 * ~95% cheaper than regular Solana accounts at scale.
 */
export async function createCompressedLoyalty(
  payer: Keypair,
  owner: PublicKey
): Promise<string> {
  const conn = createRpc(RPC_URL);
  const stateTree = defaultTestStateTreeAccounts().merkleTree;

  // Compressed account data — same fields as on-chain struct
  const loyaltyData: LoyaltyState = {
    owner,
    points: 0,
    tier: 0,
    lastActivity: Math.floor(Date.now() / 1000),
  };

  console.log("Creating compressed loyalty account...");
  console.log("  owner:", owner.toBase58());
  console.log("  state tree:", stateTree.toBase58());

  // In production: build the compressed account instruction
  // using LightSystemProgram.compress() with the loyalty data
  //
  // const ix = await LightSystemProgram.compress({
  //   payer: payer.publicKey,
  //   toAddress: deriveLoyaltyAddress(owner),
  //   lamports: 0,
  //   outputStateTree: stateTree,
  // });
  //
  // const { blockhash } = await conn.getLatestBlockhash();
  // const tx = buildAndSignTx([ix], payer, blockhash);
  // const sig = await sendAndConfirmTx(conn, tx);

  console.log("\\n  [demo mode] compressed loyalty account ready");
  console.log("  rent savings vs regular: ~95%");
  return "demo-signature";
}

/**
 * Derive deterministic address for loyalty compressed account.
 */
function deriveLoyaltyAddress(owner: PublicKey): PublicKey {
  const [addr] = PublicKey.findProgramAddressSync(
    [Buffer.from("loyalty"), owner.toBuffer()],
    new PublicKey("YOUR_PROGRAM_ID")
  );
  return addr;
}

// CLI entry
if (require.main === module) {
  const wallet = Keypair.generate();
  createCompressedLoyalty(wallet, wallet.publicKey)
    .then(() => console.log("\\ndone"))
    .catch(console.error);
}
`
}

function loyaltyReadme(): string {
  return `# Loyalty Program — ZK Compressed

On-chain loyalty points with ZK Compression. Built with [CompressKit](https://github.com/compresskit).

## Architecture

\`\`\`
User → Anchor Program → LoyaltyAccount (compressed via Light Protocol)
                       → ~95% rent savings at scale
\`\`\`

## Account Structure

| Field          | Type    | Size |
|----------------|---------|------|
| owner          | Pubkey  | 32   |
| points         | u64     | 8    |
| tier           | u8      | 1    |
| last_activity  | i64     | 8    |
| bump           | u8      | 1    |

## Instructions

- \`initialize\` — create loyalty account for wallet
- \`add_points\` — award points, auto-update tier
- \`redeem_points\` — spend points with balance check

## Tier System

| Tier     | Points Required |
|----------|----------------|
| Bronze   | 0 - 999        |
| Silver   | 1,000 - 4,999  |
| Gold     | 5,000 - 19,999 |
| Platinum | 20,000+        |

## Getting Started

\`\`\`bash
anchor build
anchor deploy
cd app && npm install && npm start
\`\`\`

## ZK Compression

This template is pre-wired for Light Protocol ZK Compression.
Uncomment the \`light-sdk\` dependency in \`Cargo.toml\` and swap
\`Account<'info, T>\` for compressed account types to enable
state compression with ~95% rent savings.

Scaffolded by \`compresskit template loyalty\`.
`
}

// ── gaming template ───────────────────────────────────────

function gamingLib(): string {
  return `use anchor_lang::prelude::*;

declare_id!("YOUR_PROGRAM_ID");

// ZK Compression: swap Account<'info, T> for CompressedAccount<T>
// when migrating to Light Protocol SDK

#[program]
pub mod gaming {
    use super::*;

    pub fn initialize(ctx: Context<InitPlayer>) -> Result<()> {
        let profile = &mut ctx.accounts.player_profile;
        profile.owner = ctx.accounts.player.key();
        profile.score = 0;
        profile.level = 1;
        profile.achievements = 0;
        profile.last_login = Clock::get()?.unix_timestamp;
        profile.bump = ctx.bumps.player_profile;
        Ok(())
    }

    pub fn update_score(ctx: Context<UpdatePlayer>, delta: u64) -> Result<()> {
        let profile = &mut ctx.accounts.player_profile;
        profile.score = profile.score.checked_add(delta).ok_or(ErrorCode::MathOverflow)?;
        profile.last_login = Clock::get()?.unix_timestamp;

        // level up every 1000 points
        let new_level = profile
            .score
            .checked_div(1000)
            .ok_or(ErrorCode::MathOverflow)?
            .checked_add(1)
            .ok_or(ErrorCode::MathOverflow)?;
        if new_level <= u16::MAX as u64 {
            profile.level = new_level as u16;
        }

        Ok(())
    }

    pub fn unlock_achievement(ctx: Context<UpdatePlayer>, achievement_bit: u8) -> Result<()> {
        require!(achievement_bit < 32, ErrorCode::InvalidAchievement);
        let profile = &mut ctx.accounts.player_profile;
        let mask = 1u32 << achievement_bit;
        require!(profile.achievements & mask == 0, ErrorCode::AlreadyUnlocked);
        profile.achievements |= mask;
        profile.last_login = Clock::get()?.unix_timestamp;
        Ok(())
    }
}

// ── accounts ──────────────────────────────────────────────

#[derive(Accounts)]
pub struct InitPlayer<'info> {
    #[account(
        init,
        payer = player,
        space = 8 + PlayerProfile::INIT_SPACE,
        seeds = [b"player", player.key().as_ref()],
        bump,
    )]
    pub player_profile: Account<'info, PlayerProfile>,
    #[account(mut)]
    pub player: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePlayer<'info> {
    #[account(
        mut,
        seeds = [b"player", player.key().as_ref()],
        bump = player_profile.bump,
        constraint = player_profile.owner == player.key() @ ErrorCode::Unauthorized,
    )]
    pub player_profile: Account<'info, PlayerProfile>,
    pub player: Signer<'info>,
}

// ── state ─────────────────────────────────────────────────
// With ZK Compression this struct becomes a compressed account:
// ideal for games with millions of players

#[account]
#[derive(InitSpace)]
pub struct PlayerProfile {
    pub owner: Pubkey,        // 32
    pub score: u64,           // 8
    pub level: u16,           // 2
    pub achievements: u32,    // 4 — 32 achievement bits
    pub last_login: i64,      // 8
    pub bump: u8,             // 1
}

// ── errors ────────────────────────────────────────────────

#[error_code]
pub enum ErrorCode {
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Invalid achievement bit (must be 0-31)")]
    InvalidAchievement,
    #[msg("Achievement already unlocked")]
    AlreadyUnlocked,
    #[msg("Unauthorized: signer is not the profile owner")]
    Unauthorized,
}
`
}

function gamingClient(): string {
  return `import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import {
  LightSystemProgram,
  buildAndSignTx,
  createRpc,
  defaultTestStateTreeAccounts,
  sendAndConfirmTx,
} from "@lightprotocol/stateless.js";
import dotenv from "dotenv";

dotenv.config();

// ZK Compression helpers for player profiles
// Uses Light Protocol SDK for compressed game state

const RPC_URL = process.env.LIGHT_RPC_URL || "https://api.devnet.solana.com";

interface PlayerState {
  owner: PublicKey;
  score: number;
  level: number;
  achievements: number;
  lastLogin: number;
}

/**
 * Create compressed player profile via Light Protocol.
 * Games with 1M+ players save ~95% on rent.
 */
export async function createCompressedPlayer(
  payer: Keypair,
  player: PublicKey
): Promise<string> {
  const conn = createRpc(RPC_URL);
  const stateTree = defaultTestStateTreeAccounts().merkleTree;

  const playerData: PlayerState = {
    owner: player,
    score: 0,
    level: 1,
    achievements: 0,
    lastLogin: Math.floor(Date.now() / 1000),
  };

  console.log("Creating compressed player profile...");
  console.log("  player:", player.toBase58());
  console.log("  state tree:", stateTree.toBase58());

  // In production: build compressed account instruction
  //
  // const ix = await LightSystemProgram.compress({
  //   payer: payer.publicKey,
  //   toAddress: derivePlayerAddress(player),
  //   lamports: 0,
  //   outputStateTree: stateTree,
  // });
  //
  // const { blockhash } = await conn.getLatestBlockhash();
  // const tx = buildAndSignTx([ix], payer, blockhash);
  // const sig = await sendAndConfirmTx(conn, tx);

  console.log("\\n  [demo mode] compressed player profile ready");
  console.log("  rent savings vs regular: ~95%");
  return "demo-signature";
}

/**
 * Derive deterministic address for player compressed account.
 */
function derivePlayerAddress(player: PublicKey): PublicKey {
  const [addr] = PublicKey.findProgramAddressSync(
    [Buffer.from("player"), player.toBuffer()],
    new PublicKey("YOUR_PROGRAM_ID")
  );
  return addr;
}

// CLI entry
if (require.main === module) {
  const wallet = Keypair.generate();
  createCompressedPlayer(wallet, wallet.publicKey)
    .then(() => console.log("\\ndone"))
    .catch(console.error);
}
`
}

function gamingReadme(): string {
  return `# Gaming Player Profiles — ZK Compressed

On-chain player profiles with achievements, leveling, and ZK Compression.
Built with [CompressKit](https://github.com/compresskit).

## Architecture

\`\`\`
Player → Anchor Program → PlayerProfile (compressed via Light Protocol)
                        → 32-bit achievement bitmask
                        → auto-leveling every 1000 points
\`\`\`

## Account Structure

| Field        | Type    | Size | Notes                  |
|--------------|---------|------|------------------------|
| owner        | Pubkey  | 32   |                        |
| score        | u64     | 8    |                        |
| level        | u16     | 2    | auto-calc from score   |
| achievements | u32     | 4    | 32 unlockable bits     |
| last_login   | i64     | 8    |                        |
| bump         | u8      | 1    |                        |

## Instructions

- \`initialize\` — create player profile
- \`update_score\` — add score delta, auto-level
- \`unlock_achievement\` — flip achievement bit (0-31)

## Getting Started

\`\`\`bash
anchor build
anchor deploy
cd app && npm install && npm start
\`\`\`

## ZK Compression

Perfect for games with massive player bases. Each player profile
costs ~95% less rent when compressed via Light Protocol. Uncomment
the \`light-sdk\` dependency and swap account types to enable.

Scaffolded by \`compresskit template gaming\`.
`
}

// ── social template ───────────────────────────────────────

function socialLib(): string {
  return `use anchor_lang::prelude::*;

declare_id!("YOUR_PROGRAM_ID");

// ZK Compression: swap Account<'info, T> for CompressedAccount<T>
// when migrating to Light Protocol SDK

#[program]
pub mod social {
    use super::*;

    pub fn initialize(ctx: Context<InitProfile>) -> Result<()> {
        let profile = &mut ctx.accounts.social_profile;
        profile.owner = ctx.accounts.user.key();
        profile.followers = 0;
        profile.following = 0;
        profile.posts = 0;
        profile.joined_at = Clock::get()?.unix_timestamp;
        profile.bump = ctx.bumps.social_profile;
        Ok(())
    }

    pub fn follow(ctx: Context<FollowAction>) -> Result<()> {
        let target = &mut ctx.accounts.target_profile;
        let follower = &mut ctx.accounts.follower_profile;

        target.followers = target
            .followers
            .checked_add(1)
            .ok_or(ErrorCode::MathOverflow)?;
        follower.following = follower
            .following
            .checked_add(1)
            .ok_or(ErrorCode::MathOverflow)?;

        Ok(())
    }

    pub fn create_post(ctx: Context<CreatePost>) -> Result<()> {
        let profile = &mut ctx.accounts.social_profile;
        profile.posts = profile
            .posts
            .checked_add(1)
            .ok_or(ErrorCode::MathOverflow)?;
        Ok(())
    }
}

// ── accounts ──────────────────────────────────────────────

#[derive(Accounts)]
pub struct InitProfile<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + SocialProfile::INIT_SPACE,
        seeds = [b"social", user.key().as_ref()],
        bump,
    )]
    pub social_profile: Account<'info, SocialProfile>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FollowAction<'info> {
    #[account(
        mut,
        seeds = [b"social", target_owner.key().as_ref()],
        bump = target_profile.bump,
        constraint = target_profile.owner == target_owner.key() @ ErrorCode::InvalidProfile,
    )]
    pub target_profile: Account<'info, SocialProfile>,
    /// CHECK: target wallet, no signature required (anyone can follow)
    pub target_owner: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"social", follower.key().as_ref()],
        bump = follower_profile.bump,
        constraint = follower_profile.owner == follower.key() @ ErrorCode::Unauthorized,
    )]
    pub follower_profile: Account<'info, SocialProfile>,
    pub follower: Signer<'info>,
}

#[derive(Accounts)]
pub struct CreatePost<'info> {
    #[account(
        mut,
        seeds = [b"social", author.key().as_ref()],
        bump = social_profile.bump,
        constraint = social_profile.owner == author.key() @ ErrorCode::Unauthorized,
    )]
    pub social_profile: Account<'info, SocialProfile>,
    pub author: Signer<'info>,
}

// ── state ─────────────────────────────────────────────────
// With ZK Compression this struct becomes a compressed account:
// social platforms = millions of profiles = massive rent savings

#[account]
#[derive(InitSpace)]
pub struct SocialProfile {
    pub owner: Pubkey,      // 32
    pub followers: u32,     // 4
    pub following: u32,     // 4
    pub posts: u32,         // 4
    pub joined_at: i64,     // 8
    pub bump: u8,           // 1
}

// ── errors ────────────────────────────────────────────────

#[error_code]
pub enum ErrorCode {
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Invalid target profile")]
    InvalidProfile,
    #[msg("Unauthorized: signer is not the profile owner")]
    Unauthorized,
}
`
}

function socialClient(): string {
  return `import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import {
  LightSystemProgram,
  buildAndSignTx,
  createRpc,
  defaultTestStateTreeAccounts,
  sendAndConfirmTx,
} from "@lightprotocol/stateless.js";
import dotenv from "dotenv";

dotenv.config();

// ZK Compression helpers for social profiles
// Uses Light Protocol SDK for compressed social graph

const RPC_URL = process.env.LIGHT_RPC_URL || "https://api.devnet.solana.com";

interface SocialState {
  owner: PublicKey;
  followers: number;
  following: number;
  posts: number;
  joinedAt: number;
}

/**
 * Create compressed social profile via Light Protocol.
 * Social platforms with millions of users save ~95% on rent.
 */
export async function createCompressedProfile(
  payer: Keypair,
  user: PublicKey
): Promise<string> {
  const conn = createRpc(RPC_URL);
  const stateTree = defaultTestStateTreeAccounts().merkleTree;

  const profileData: SocialState = {
    owner: user,
    followers: 0,
    following: 0,
    posts: 0,
    joinedAt: Math.floor(Date.now() / 1000),
  };

  console.log("Creating compressed social profile...");
  console.log("  user:", user.toBase58());
  console.log("  state tree:", stateTree.toBase58());

  // In production: build compressed account instruction
  //
  // const ix = await LightSystemProgram.compress({
  //   payer: payer.publicKey,
  //   toAddress: deriveProfileAddress(user),
  //   lamports: 0,
  //   outputStateTree: stateTree,
  // });
  //
  // const { blockhash } = await conn.getLatestBlockhash();
  // const tx = buildAndSignTx([ix], payer, blockhash);
  // const sig = await sendAndConfirmTx(conn, tx);

  console.log("\\n  [demo mode] compressed social profile ready");
  console.log("  rent savings vs regular: ~95%");
  return "demo-signature";
}

/**
 * Derive deterministic address for social compressed account.
 */
function deriveProfileAddress(user: PublicKey): PublicKey {
  const [addr] = PublicKey.findProgramAddressSync(
    [Buffer.from("social"), user.toBuffer()],
    new PublicKey("YOUR_PROGRAM_ID")
  );
  return addr;
}

// CLI entry
if (require.main === module) {
  const wallet = Keypair.generate();
  createCompressedProfile(wallet, wallet.publicKey)
    .then(() => console.log("\\ndone"))
    .catch(console.error);
}
`
}

function socialReadme(): string {
  return `# Social Profiles — ZK Compressed

On-chain social graph with follow/post counters and ZK Compression.
Built with [CompressKit](https://github.com/compresskit).

## Architecture

\`\`\`
User → Anchor Program → SocialProfile (compressed via Light Protocol)
                      → follow action updates both profiles
                      → post counter for content tracking
\`\`\`

## Account Structure

| Field     | Type   | Size |
|-----------|--------|------|
| owner     | Pubkey | 32   |
| followers | u32    | 4    |
| following | u32    | 4    |
| posts     | u32    | 4    |
| joined_at | i64    | 8    |
| bump      | u8     | 1    |

## Instructions

- \`initialize\` — create social profile for wallet
- \`follow\` — increment follower/following counts on both profiles
- \`create_post\` — increment post counter

## Getting Started

\`\`\`bash
anchor build
anchor deploy
cd app && npm install && npm start
\`\`\`

## ZK Compression

Social platforms can have millions of profiles. Each profile compressed
via Light Protocol costs ~95% less rent than standard Solana accounts.
Uncomment the \`light-sdk\` dependency and swap account types to enable.

Scaffolded by \`compresskit template social\`.
`
}

// ── template registry ─────────────────────────────────────

interface TemplateConfig {
  programName: string
  label: string
  desc: string
}

const CONFIGS: Record<TemplateType, TemplateConfig> = {
  loyalty: {
    programName: 'loyalty',
    label: 'Loyalty Program',
    desc: 'points, tiers, redemption',
  },
  gaming: {
    programName: 'gaming',
    label: 'Gaming Profiles',
    desc: 'score, leveling, achievements',
  },
  social: {
    programName: 'social',
    label: 'Social Profiles',
    desc: 'followers, posts, social graph',
  },
}

const LIB_FNS: Record<TemplateType, () => string> = {
  loyalty: loyaltyLib,
  gaming: gamingLib,
  social: socialLib,
}

const CLIENT_FNS: Record<TemplateType, () => string> = {
  loyalty: loyaltyClient,
  gaming: gamingClient,
  social: socialClient,
}

const README_FNS: Record<TemplateType, () => string> = {
  loyalty: loyaltyReadme,
  gaming: gamingReadme,
  social: socialReadme,
}

/**
 * Get all files for a template type.
 */
export function getTemplateFiles(type: TemplateType): TemplateFile[] {
  const cfg = CONFIGS[type]
  if (!cfg) throw new Error(`unknown template: ${type}`)

  return [
    { path: `programs/${cfg.programName}/Cargo.toml`, content: cargoToml(cfg.programName) },
    { path: `programs/${cfg.programName}/src/lib.rs`, content: LIB_FNS[type]() },
    { path: 'app/package.json', content: appPkgJson(cfg.programName) },
    { path: 'app/src/compress.ts', content: CLIENT_FNS[type]() },
    { path: 'Anchor.toml', content: anchorToml(cfg.programName) },
    { path: '.env.example', content: envExample() },
    { path: 'README.md', content: README_FNS[type]() },
  ]
}

/**
 * Get display info for a template type.
 */
export function getTemplateInfo(type: TemplateType): TemplateConfig {
  return CONFIGS[type]
}
