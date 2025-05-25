import { z } from 'zod';
import dotenv from 'dotenv';
import { AppConfig, Environment, GasPriority } from '@/types/config';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  ENVIRONMENT: z.enum(['development', 'production'] as const).default('production'),

  TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN is required'),

  ETHEREUM_MAINNET_RPC: z.string().url('ETHEREUM_MAINNET_RPC must be a valid URL'),
  BASE_MAINNET_RPC: z.string().url('BASE_MAINNET_RPC must be a valid URL'),
  BASE_SEPOLIA_RPC: z.string().url('BASE_SEPOLIA_RPC must be a valid URL'),
  BNC_RPC: z.string().url('BNC_RPC must be a valid URL'),

  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  PRISMA_FIELD_ENCRYPTION_KEY: z
    .string()
    .min(32, 'PRISMA_FIELD_ENCRYPTION_KEY must be at least 32 characters'),

  DEFAULT_SLIPPAGE: z.coerce.number().min(0).max(100).default(1),
  DEFAULT_FEE: z.coerce.number().min(0).max(100).default(1),
  DEFAULT_FEE_WALLET: z.string().optional().default(''),
  DEFAULT_GAS_PRIORITY: z.enum(['standard', 'fast', 'instant'] as const).default('standard'),

  COVALENTHQ_API_KEY: z.string().min(1, 'COVALENTHQ_API_KEY is required'),

  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_KEY: z.string().min(1, 'SUPABASE_KEY is required'),
  SUPABASE_SERVICE_KEY: z.string().min(1, 'SUPABASE_SERVICE_KEY is required'),
  MASTER_ENCRYPTION_PASSWORD: z
    .string()
    .min(32, 'MASTER_ENCRYPTION_PASSWORD must be at least 32 characters'),
  BETTERSTACK_SOURCE_TOKEN: z.string().min(1, 'BETTERSTACK_SOURCE_TOKEN is required'),
  BETTERSTACK_ENDPOINT: z.string().url('BETTERSTACK_ENDPOINT must be a valid URL'),
});

/**
 * Parse and validate environment variables
 */
const parseEnv = (): z.infer<typeof envSchema> => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');
      throw new Error(`Invalid environment variables:\n${missingVars}`);
    }
    throw error;
  }
};

/**
 * Transform environment variables into application config
 */
const createConfig = (): AppConfig => {
  const env = parseEnv();
  return {
    // General settings
    projectName: 'Neurodex',
    environment: env.ENVIRONMENT as Environment,

    // Tg Bot Settings
    telegramBotToken: env.TELEGRAM_BOT_TOKEN,

    // Node RPCs
    node: {
      ethereumMainnetRpc: env.ETHEREUM_MAINNET_RPC,
      baseMainnetRpc: env.BASE_MAINNET_RPC,
      baseSepoliaRpc: env.BASE_SEPOLIA_RPC,
      bncRpc: env.BNC_RPC,
    },

    // Trading Settings
    trading: {
      defaultSlippage: env.DEFAULT_SLIPPAGE,
      defaultFee: env.DEFAULT_FEE,
      defaultFeeWallet: env.DEFAULT_FEE_WALLET,
      defaultGasPriority: env.DEFAULT_GAS_PRIORITY as GasPriority,
    },

    // Database Settings
    database: {
      url: env.DATABASE_URL,
      encryptionKey: env.PRISMA_FIELD_ENCRYPTION_KEY,
    },

    // Third Party APIs
    covalenthqApiKey: env.COVALENTHQ_API_KEY,

    // Supabase Settings
    supabase: {
      url: env.SUPABASE_URL,
      key: env.SUPABASE_KEY,
      serviceKey: env.SUPABASE_SERVICE_KEY,
    },

    // Encryption Settings
    encryption: {
      masterPassword: env.MASTER_ENCRYPTION_PASSWORD,
    },

    // BetterStack Logging
    betterstack: {
      sourceToken: env.BETTERSTACK_SOURCE_TOKEN,
      endpoint: env.BETTERSTACK_ENDPOINT,
    },

    // Constants
    // Chain IDs can be found here:
    // - https://chainlist.org/
    // - https://apis.openocean.finance/developer/developer-resources/supported-chains
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
    MAX_UINT256: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
  };
};

export const config = createConfig();
