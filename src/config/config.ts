import dotenv from 'dotenv';

// load
dotenv.config();

/**
 * Application configuration object
 * All values are loaded from environment variables
 */
export const config = {
  // General settings
  projectName: 'Neurodex',
  environment: process.env.ENVIRONMENT || 'production',

  // Node RPCs
  node: {
    ethereumMainnetRpc: process.env.ETHEREUM_MAINNET_RPC!,
    baseMainnetRpc: process.env.BASE_MAINNET_RPC!,
    baseSepoliaRpc: process.env.BASE_SEPOLIA_RPC!,
    bncRpc: process.env.BNC_RPC!,
  },

  // Telegram Bot Settings
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN!,
    botUsername: process.env.TELEGRAM_BOT_USERNAME!,
  },

  // Referrer Wallet Address
  referrerWalletAddress: process.env.REFERRER_WALLET_ADDRESS!,

  // Trading Settings
  trading: {
    defaultSlippage: Number(process.env.DEFAULT_SLIPPAGE) || 1,
    defaultFee: Number(process.env.DEFAULT_FEE) || 1,
    defaultFeeWallet: process.env.DEFAULT_FEE_WALLET || '',
    defaultGasPriority: process.env.DEFAULT_GAS_PRIORITY || 'standard',
  },

  // Database Settings
  database: {
    url: process.env.DATABASE_URL!,
    encryptionKey: process.env.PRISMA_FIELD_ENCRYPTION_KEY!,
  },

  // Third Party APIs
  covalenthqApiKey: process.env.COVALENTHQ_API_KEY!,
  coinstatsApiKey: process.env.COINSTATS_API_KEY!,

  // Supabase Settings
  supabase: {
    url: process.env.SUPABASE_URL!,
    key: process.env.SUPABASE_KEY!,
    serviceKey: process.env.SUPABASE_SERVICE_KEY!,
  },

  // Encryption Settings
  encryption: {
    masterPassword: process.env.MASTER_ENCRYPTION_PASSWORD!,
  },

  // BetterStack Logging
  betterstack: {
    sourceToken: process.env.BETTERSTACK_SOURCE_TOKEN!,
    endpoint: process.env.BETTERSTACK_ENDPOINT!,
  },

  // Chain IDs
  chain: {
    baseChainId: 8453,
    baseSepoliaChainId: 84532,
    ethereumChainId: 1,
    bnbChainId: 56,
  },

  // Native Token Addresses
  nativeTokenAddress: {
    base: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    ethereum: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    bsc: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  },

  // Rate Limiting
  rateLimit: {
    perSecond: Number(process.env.RATE_LIMIT_PER_SECOND) || 3,
    perMinute: Number(process.env.RATE_LIMIT_PER_MINUTE) || 50,
    per15Minutes: Number(process.env.RATE_LIMIT_PER_15MIN) || 300,
  },

  // Constants
  MAX_UINT256: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
  defaultReferrerFee: 1,
} as const;
