# Trading API Reference

This document provides comprehensive API documentation for the Telegram Neurotrading Bot trading service, which enables token swaps, limit orders, DCA orders, and wallet management across multiple blockchain networks.

## Table of Contents

- [Overview](#overview)
- [Supported Chains](#supported-chains)
- [NeuroDexApi Class](#neurodexapi-class)
  - [Constructor](#constructor)
  - [Wallet Operations](#wallet-operations)
  - [Trading Operations](#trading-operations)
  - [Limit Orders](#limit-orders)
  - [DCA Orders](#dca-orders)
  - [Utility Methods](#utility-methods)
- [Response Format](#response-format)
- [Error Codes](#error-codes)
- [Type Definitions](#type-definitions)

---

## Overview

The Trading API provides a unified interface for DeFi trading operations through the OpenOcean DEX aggregator. It handles:

- Token swaps (buy/sell) with optimal routing
- Limit orders for automated trading at target prices
- Dollar Cost Averaging (DCA) for recurring purchases
- Wallet generation and management
- Multi-chain support (Base, Ethereum, BSC)

## Supported Chains

| Chain    | Chain ID | Native Token | Description           |
|----------|----------|--------------|------------------------|
| base     | 8453     | ETH          | Base mainnet (primary) |
| ethereum | 1        | ETH          | Ethereum mainnet       |
| bsc      | 56       | BNB          | BNB Smart Chain        |

---

## NeuroDexApi Class

Located at: `src/services/engine/neurodex.ts`

### Constructor

```typescript
new NeuroDexApi(chain?: NeuroDexChain, rpcUrl?: string)
```

**Parameters:**

| Parameter | Type           | Default              | Description                    |
|-----------|----------------|----------------------|--------------------------------|
| chain     | NeuroDexChain  | `'base'`             | Target blockchain network      |
| rpcUrl    | string         | `config.node.baseMainnetRpc` | RPC URL for blockchain calls |

**Example:**

```typescript
import { NeuroDexApi } from '@/services/engine/neurodex';

// Default Base network
const neuroDex = new NeuroDexApi();

// Ethereum with custom RPC
const neuroDexEth = new NeuroDexApi('ethereum', 'https://eth-mainnet.alchemyapi.io/...');
```

---

## Wallet Operations

### createWallet()

Creates a new wallet with a cryptographically secure private key and stores it securely.

```typescript
async createWallet(): Promise<WalletInfo>
```

**Returns:** `WalletInfo`

```typescript
interface WalletInfo {
  address: string;    // Wallet address (e.g., "0x742d35Cc...")
  privateKey: string; // Private key (e.g., "0x1234...")
}
```

**Example:**

```typescript
const wallet = await neuroDex.createWallet();
console.log(wallet.address);    // "0x742d35Cc6Cb3C0532C94c3e66d7E17B9d3d17B9c"
console.log(wallet.privateKey); // "0x1234567890abcdef..."
```

**Errors:**

| Error Message                       | Cause                              |
|-------------------------------------|------------------------------------|
| `Failed to store private key securely` | Supabase storage operation failed |

---

### getPrivateKey()

Retrieves the private key for a wallet address from secure storage.

```typescript
async getPrivateKey(walletAddress: string): Promise<string | null>
```

**Parameters:**

| Parameter     | Type   | Description           |
|---------------|--------|-----------------------|
| walletAddress | string | The wallet address    |

**Returns:** Private key string or `null` if not found.

---

## Trading Operations

### buy()

Buy tokens using the chain's native token (ETH/BNB).

```typescript
async buy(
  params: BuyParams,
  chain?: NeuroDexChain
): Promise<NeuroDexResponse<SwapResult>>
```

**Parameters:**

```typescript
interface BuyParams {
  toTokenAddress: string;   // Contract address of token to purchase
  fromAmount: number;       // Amount of native token to spend (e.g., 0.1 for 0.1 ETH)
  slippage: number;         // Slippage tolerance in percentage (e.g., 1 for 1%)
  gasPriority: GasPriority; // 'standard' | 'fast' | 'instant'
  walletAddress: string;    // User's wallet address
  privateKey: string;       // User's private key for signing
  referrer?: string;        // Optional referrer address for fee sharing
}
```

**Response:**

```typescript
interface SwapResult {
  inToken: {
    address: string;
    symbol: string;
    decimals: number;
  };
  outToken: {
    address: string;
    symbol: string;
    decimals: number;
  };
  inAmount: number;         // Amount spent (in base units)
  outAmount: number;        // Amount received (in base units)
  estimatedGas: number;     // Gas used
  price_impact?: number;    // Price impact percentage
  txHash: string;           // Transaction hash
}
```

**Example:**

```typescript
const result = await neuroDex.buy({
  toTokenAddress: '0xA0b86a33E6411A3Ab7e3AC05934AD6a4d923f3e', // USDC
  fromAmount: 0.1,          // 0.1 ETH
  slippage: 1,              // 1% slippage tolerance
  gasPriority: 'standard',
  walletAddress: '0x742d35Cc6Cb3C0532C94c3e66d7E17B9d3d17B9c',
  privateKey: '0x1234...'
});

if (result.success) {
  console.log('Transaction hash:', result.data.txHash);
  console.log('Received tokens:', result.data.outAmount);
} else {
  console.error('Buy failed:', result.error);
}
```

---

### sell()

Sell tokens to receive the chain's native token (ETH/BNB).

```typescript
async sell(
  params: SellParams,
  chain?: NeuroDexChain
): Promise<NeuroDexResponse<SwapResult>>
```

**Parameters:**

```typescript
interface SellParams {
  fromTokenAddress: string; // Contract address of token to sell
  fromAmount: number;       // Amount of tokens to sell (e.g., 100 for 100 USDC)
  slippage: number;         // Slippage tolerance in percentage
  gasPriority: GasPriority; // 'standard' | 'fast' | 'instant'
  walletAddress: string;    // User's wallet address
  privateKey: string;       // User's private key for signing
  referrer?: string;        // Optional referrer address
}
```

**Example:**

```typescript
const result = await neuroDex.sell({
  fromTokenAddress: '0xA0b86a33E6411A3Ab7e3AC05934AD6a4d923f3e', // USDC
  fromAmount: 1000,         // 1000 USDC
  slippage: 1,
  gasPriority: 'fast',
  walletAddress: '0x742d35...',
  privateKey: '0x1234...'
});
```

**Note:** The sell operation automatically handles token approval if required.

---

### withdraw()

Withdraw native tokens from a user's wallet to another address.

```typescript
async withdraw(
  params: WithdrawParams,
  chain?: NeuroDexChain
): Promise<NeuroDexResponse<WithdrawResult>>
```

**Parameters:**

```typescript
interface WithdrawParams {
  toAddress: string;        // Recipient wallet address
  amount: number;           // Amount to withdraw (e.g., 0.1 for 0.1 ETH)
  slippage: number;         // Slippage tolerance
  gasPriority: GasPriority; // Gas priority
  walletAddress: string;    // Sender wallet address
  privateKey: string;       // Private key for signing
}
```

**Response:**

```typescript
interface WithdrawResult {
  txHash: string;      // Transaction hash
  amount: string;      // Amount withdrawn (in wei)
  toAddress: string;   // Recipient address
  fromAddress: string; // Sender address
  gasUsed: string;     // Gas used
}
```

---

## Limit Orders

### createLimitOrder()

Create a limit order that executes when the target price is reached.

```typescript
async createLimitOrder(
  params: LimitOrderParams,
  chain?: NeuroDexChain
): Promise<NeuroDexResponse<LimitOrderResult>>
```

**Parameters:**

```typescript
interface LimitOrderParams {
  fromTokenAddress: string; // Token to sell
  toTokenAddress: string;   // Token to buy
  fromAmount: number;       // Amount to sell (human-readable)
  toAmount: number;         // Amount to receive (human-readable)
  expire: string;           // Expiration: "10M", "1H", "1D", "7D", "1W"
  slippage: number;
  gasPriority: GasPriority;
  walletAddress: string;
  privateKey: string;
  referrer?: string;
}
```

**Expiration Format:**

| Value | Duration    |
|-------|-------------|
| `10M` | 10 minutes  |
| `1H`  | 1 hour      |
| `1D`  | 1 day       |
| `7D`  | 7 days      |
| `1W`  | 1 week      |

**Response:**

```typescript
interface LimitOrderResult {
  orderHash: string;         // Unique order identifier
  createdAt: string;         // ISO 8601 timestamp
  expiresAt: string;         // ISO 8601 timestamp
  makerTokenAddress: string; // Token being sold
  takerTokenAddress: string; // Token being bought
  makerAmount: string;       // Amount to sell
  takerAmount: string;       // Amount to receive
}
```

**Example:**

```typescript
const result = await neuroDex.createLimitOrder({
  fromTokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
  toTokenAddress: '0x0000000000000000000000000000000000000000',   // ETH
  fromAmount: 100,     // Sell 100 USDC
  toAmount: 0.05,      // Receive 0.05 ETH
  expire: '1D',        // Expires in 1 day
  slippage: 1,
  gasPriority: 'standard',
  walletAddress: '0x742d35...',
  privateKey: '0x1234...'
});

console.log('Order created:', result.data.orderHash);
```

---

### getLimitOrders()

Retrieve limit orders for a wallet address.

```typescript
async getLimitOrders(
  params: GetLimitOrdersParams,
  chain?: NeuroDexChain
): Promise<NeuroDexResponse<LimitOrderInfo[]>>
```

**Parameters:**

```typescript
interface GetLimitOrdersParams {
  address: string;         // Wallet address
  statuses?: number[];     // Filter by status (default: [1, 2, 5])
  page?: number;           // Page number (default: 1)
  limit?: number;          // Results per page (default: 100)
}
```

**Order Status Codes:**

| Code | Status         | Description              |
|------|----------------|--------------------------|
| 1    | unfilled       | Order is open            |
| 2    | failed         | Order execution failed   |
| 3    | cancelled      | Order was cancelled      |
| 4    | filled         | Order fully executed     |
| 5    | pending        | Order is being processed |
| 6    | hash_not_exist | Order not found          |
| 7    | expired        | Order has expired        |

---

### cancelLimitOrder()

Cancel an existing limit order.

```typescript
async cancelLimitOrder(
  params: CancelLimitOrderParams,
  chain?: NeuroDexChain
): Promise<NeuroDexResponse<{ code: number }>>
```

**Parameters:**

```typescript
interface CancelLimitOrderParams {
  orderHash: string;              // Order hash to cancel
  orderData: LimitOrderAssetData; // Order data
  slippage: number;
  gasPriority: GasPriority;
  walletAddress: string;
  privateKey: string;
}
```

---

### estimateLimitOrderFee()

Estimate gas fees for creating a limit order.

```typescript
async estimateLimitOrderFee(
  params: FeeEstimationParams,
  chain?: NeuroDexChain
): Promise<NeuroDexResponse<FeeEstimation>>
```

**Parameters:**

```typescript
interface FeeEstimationParams {
  fromTokenAddress: string;
  toTokenAddress: string;
  fromAmount: number;
  toAmount: number;
  walletAddress: string;
  gasPriority: GasPriority;
}
```

**Response:**

```typescript
interface FeeEstimation {
  gasWei: string;      // Estimated gas in wei
  gasEth: string;      // Estimated gas in ETH
  gasUsd: string;      // Estimated gas in USD
  ethPriceUsd: number; // Current ETH price
  gasPriceGwei: string; // Gas price used
}
```

**Example:**

```typescript
const estimation = await neuroDex.estimateLimitOrderFee({
  fromTokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  toTokenAddress: '0x0000000000000000000000000000000000000000',
  fromAmount: 100,
  toAmount: 0.05,
  walletAddress: '0x742d35...',
  gasPriority: 'standard'
});

console.log('Estimated cost:', estimation.data.gasUsd, 'USD');
```

---

## DCA Orders

### createDcaOrder()

Create a Dollar Cost Averaging order for recurring token purchases.

```typescript
async createDcaOrder(
  params: DcaParams,
  chain?: NeuroDexChain
): Promise<NeuroDexResponse<{ code: number }>>
```

**Parameters:**

```typescript
interface DcaParams {
  toTokenAddress: string;   // Token to buy
  fromAmount: number;       // Total amount of native token to spend
  time: number;             // Interval in seconds between purchases
  times: number;            // Number of purchase intervals
  expire: string;           // Order expiration ("10M", "1H", "1D", etc.)
  minPrice?: string;        // Optional minimum price to execute
  maxPrice?: string;        // Optional maximum price to execute
  slippage: number;
  gasPriority: GasPriority;
  walletAddress: string;
  privateKey: string;
  referrer?: string;
}
```

**Example:**

```typescript
// Buy tokens over 24 hours in 4 intervals (every 6 hours)
const result = await neuroDex.createDcaOrder({
  toTokenAddress: '0xA0b86a33E6411A3Ab7e3AC05934AD6a4d923f3e',
  fromAmount: 0.4,         // 0.4 ETH total
  time: 21600,             // 6 hours in seconds
  times: 4,                // 4 purchases
  expire: '2D',            // Expires in 2 days
  slippage: 2,
  gasPriority: 'standard',
  walletAddress: '0x742d35...',
  privateKey: '0x1234...'
});
```

---

### getDcaOrders()

Retrieve DCA orders for a wallet address.

```typescript
async getDcaOrders(
  params: GetDcaOrdersParams,
  chain?: NeuroDexChain
): Promise<NeuroDexResponse<DcaOrderInfo[]>>
```

**Response:**

```typescript
interface DcaOrderInfo {
  orderHash: string;
  status: string;          // 'unfilled', 'filled', 'cancelled', etc.
  data: {
    makerAssetSymbol: string;
    takerAssetSymbol: string;
    makingAmount: string;
    takingAmount: string;
    makerAsset: string;
    takerAsset: string;
    maker: string;
  };
  createDateTime: string;
  expireTime: string;
  time: number;            // Interval in seconds
  times: number;           // Total intervals
  have_filled: number | null; // Completed intervals
  minPrice: string | null;
  maxPrice: string | null;
}
```

---

### cancelDcaOrder()

Cancel an existing DCA order.

```typescript
async cancelDcaOrder(
  params: CancelDcaOrderParams,
  chain?: NeuroDexChain
): Promise<NeuroDexResponse<{ code: number }>>
```

---

## Utility Methods

### getTokenDataByContractAddress()

Fetch token metadata from DexScreener API.

```typescript
async getTokenDataByContractAddress(
  tokenAddress: string,
  _network: string
): Promise<NeuroDexResponse<TokenData>>
```

**Response:**

```typescript
interface TokenData {
  address: string;
  name: string;         // Token name (e.g., "USD Coin")
  symbol: string;       // Token symbol (e.g., "USDC")
  decimals: number;     // Token decimals (e.g., 6)
  price: number;        // Current USD price
  totalSupply?: number;
  marketCap?: number;
  logo?: string;        // Token logo URL
  chain: string;        // Chain identifier
}
```

---

### generateReferralLink()

Generate a referral link for a user.

```typescript
async generateReferralLink(userId: number, username: string): Promise<string>
```

**Example:**

```typescript
const link = await neuroDex.generateReferralLink(12345678, 'johndoe');
// Returns: "https://t.me/neuro_bro_test_bot?start=r-johndoe"
```

---

## Response Format

All API methods return a `NeuroDexResponse<T>` wrapper:

```typescript
interface NeuroDexResponse<T> {
  success: boolean;  // Whether the operation succeeded
  data?: T;          // Response data (if success)
  error?: string;    // Error message (if failed)
  txHash?: string;   // Transaction hash (if applicable)
}
```

**Usage Pattern:**

```typescript
const result = await neuroDex.buy(params);

if (result.success) {
  // Handle success
  console.log('Transaction:', result.data.txHash);
} else {
  // Handle error
  console.error('Failed:', result.error);
}
```

---

## Error Codes

### Common Errors

| Error Message                              | Cause                                    | Solution                              |
|--------------------------------------------|------------------------------------------|---------------------------------------|
| `Chain mismatch between token and API instance` | Token chain differs from API instance | Create API instance for correct chain |
| `Failed to get token info`                 | Token contract not found or invalid      | Verify token address                  |
| `Quote data is undefined`                  | OpenOcean quote failed                   | Check token liquidity                 |
| `Swap data is undefined`                   | OpenOcean swap preparation failed        | Check token addresses and amounts     |
| `Token approval failed`                    | ERC20 approval transaction failed        | Check wallet balance for gas          |
| `SDK not initialized`                      | Limit order SDK not set up               | Call `initializeSdk()` first          |
| `Failed to store private key securely`     | Supabase storage error                   | Check Supabase configuration          |

### OpenOcean API Errors

| Code | Description                    |
|------|--------------------------------|
| 200  | Success                        |
| 400  | Bad request - invalid params   |
| 500  | Internal server error          |

### Transaction Errors

| Error Pattern                        | Cause                          |
|--------------------------------------|--------------------------------|
| `insufficient funds`                 | Not enough balance for gas     |
| `nonce too low`                      | Transaction already processed  |
| `gas required exceeds allowance`     | Transaction would fail         |

---

## Type Definitions

### GasPriority

```typescript
type GasPriority = 'standard' | 'fast' | 'instant';
```

| Priority | Description                    | Use Case                |
|----------|--------------------------------|-------------------------|
| standard | Normal gas price               | Regular transactions    |
| fast     | Higher gas for faster confirmation | Time-sensitive trades |
| instant  | Maximum gas for immediate execution | Urgent transactions |

### NeuroDexChain

```typescript
type NeuroDexChain = 'base' | 'ethereum' | 'bsc';
```

### OrderStatus

```typescript
type OrderStatus = 'pending' | 'executed' | 'cancelled' | 'expired';
```

---

## Related Documentation

- [Development Guide](./development.md) - Setup and coding guidelines
- [Database Schema](./database.md) - Data models and migrations
- [Testing Guide](./testing.md) - Unit and load testing
- [Deployment Guide](./deployment.md) - Production deployment
