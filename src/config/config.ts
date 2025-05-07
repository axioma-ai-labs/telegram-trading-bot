import { z } from 'zod';
import dotenv from 'dotenv';
import { AppConfig, Environment, GasPriority } from '@/types/config';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  // Project settings
  PROJECT_NAME: z.string().default('Neurodex Bot'),
  ENVIRONMENT: z.enum(['development', 'production'] as const).default('production'),

  // Telegram
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN is required'),

  // Node RPCs
  ETHEREUM_MAINNET_RPC: z.string().url('ETHEREUM_MAINNET_RPC must be a valid URL'),
  BASE_MAINNET_RPC: z.string().url('BASE_MAINNET_RPC must be a valid URL'),
  BASE_SEPOLIA_RPC: z.string().url('BASE_SEPOLIA_RPC must be a valid URL'),
  BNC_RPC: z.string().url('BNC_RPC must be a valid URL'),
  OPEN_OCEAN_ADDON_ID: z.string().min(1, 'OPEN_OCEAN_ADDON_ID is required'),

  // Wallet
  WALLET_ENCRYPTION_KEY: z.string().min(32, 'WALLET_ENCRYPTION_KEY must be at least 32 characters'),

  // Database
  DB_PATH: z.string().default('./database.sqlite'),

  // Chain IDs
  BASE_CHAIN_ID: z.coerce.number().int().positive(),
  BASE_SEPOLIA_CHAIN_ID: z.coerce.number().int().positive(),
  ETHEREUM_CHAIN_ID: z.coerce.number().int().positive(),
  BNB_CHAIN_ID: z.coerce.number().int().positive(),

  // Trading settings
  DEFAULT_SLIPPAGE: z.coerce.number().min(0).max(100).default(1),
  DEFAULT_FEE: z.coerce.number().min(0).max(100).default(1),
  DEFAULT_FEE_WALLET: z.string().optional().default(''),
  DEFAULT_GAS_PRIORITY: z.enum(['low', 'medium', 'high'] as const).default('medium'),
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
    projectName: env.PROJECT_NAME,
    environment: env.ENVIRONMENT as Environment,
    telegramBotToken: env.TELEGRAM_BOT_TOKEN,
    chain: {
      baseChainId: env.BASE_CHAIN_ID,
      baseSepoliaChainId: env.BASE_SEPOLIA_CHAIN_ID,
      ethereumChainId: env.ETHEREUM_CHAIN_ID,
      bnbChainId: env.BNB_CHAIN_ID,
    },
    trading: {
      defaultSlippage: env.DEFAULT_SLIPPAGE,
      defaultFee: env.DEFAULT_FEE,
      defaultFeeWallet: env.DEFAULT_FEE_WALLET,
      defaultGasPriority: env.DEFAULT_GAS_PRIORITY as GasPriority,
    },
    wallet: {
      encryptionKey: env.WALLET_ENCRYPTION_KEY,
    },
    database: {
      path: env.DB_PATH,
    },
    node: {
      ethereumMainnetRpc: env.ETHEREUM_MAINNET_RPC,
      baseMainnetRpc: env.BASE_MAINNET_RPC,
      baseSepoliaRpc: env.BASE_SEPOLIA_RPC,
      bncRpc: env.BNC_RPC,
      openOceanAddonId: env.OPEN_OCEAN_ADDON_ID,
    },
  };
};

/**
 * Create and export the config instance
 * This ensures the config is only parsed once during import
 */
const config = createConfig();

export default config;
