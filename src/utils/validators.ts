/**
 * @category Utils
 */
import { BotContext } from '@/types/telegram';

import { deleteBotMessage } from './deleteMessage';

//////////////////////////////////////////////////////////
// Private key validators
//////////////////////////////////////////////////////////

// validate private key
export async function validatePK(ctx: BotContext, privateKey: string | null): Promise<boolean> {
  // check if private key exists
  if (!privateKey) {
    const message = await ctx.reply(ctx.t('no_private_key_msg'));
    deleteBotMessage(ctx, message.message_id, 5000);
    return false;
  }

  // check if private key matches basic format
  if (!isValidPrivateKey(privateKey)) {
    const message = await ctx.reply(ctx.t('invalid_private_key_msg'));
    deleteBotMessage(ctx, message.message_id, 5000);
    return false;
  }

  // remove 0x prefix if present
  const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;

  // check length
  if (cleanPrivateKey.length !== 64) {
    const message = await ctx.reply(ctx.t('invalid_private_key_length_msg'));
    deleteBotMessage(ctx, message.message_id, 5000);
    return false;
  }

  return true;
}

// validate private key
export function isValidPrivateKey(privateKey: string): boolean {
  // Private key should be 64 hex characters with or without 0x prefix
  const hexRegex = /^(0x)?[0-9a-fA-F]{64}$/;
  return hexRegex.test(privateKey);
}

//////////////////////////////////////////////////////////
// DCA validators
//////////////////////////////////////////////////////////

export function isValidDcaInterval(interval: number): boolean {
  return interval > 0 && interval <= 10000;
}

export function isValidDcaTimes(times: number): boolean {
  return times > 0 && times <= 100;
}

export function isValidDcaAmount(amount: number): boolean {
  return amount > 0 && amount <= 10000;
}

//////////////////////////////////////////////////////////
// Amount validators
//////////////////////////////////////////////////////////

/**
 * Validates if the provided amount is a valid positive number.
 *
 * Checks for:
 * - Valid number format (string or number input)
 * - Not NaN, Infinity, or -Infinity
 * - Greater than 0
 * - Within reasonable bounds (not exceeding 1 billion)
 * - Not null, undefined, or empty string
 *
 * @param amount - The amount to validate (string or number)
 * @returns True if the amount is valid, false otherwise
 *
 * @example
 * ```typescript
 * isValidAmount("0.1")     // true
 * isValidAmount("100")     // true
 * isValidAmount("0")       // false (must be > 0)
 * isValidAmount("-5")      // false (negative)
 * isValidAmount("abc")     // false (not a number)
 * isValidAmount("")        // false (empty string)
 * isValidAmount(null)      // false (null)
 * isValidAmount(Infinity)  // false (not finite)
 * ```
 */
export function isValidAmount(amount: string | number | null | undefined): boolean {
  // Check for null, undefined, or empty string
  if (amount === null || amount === undefined || amount === '') {
    return false;
  }

  // Convert to number if it's a string
  const numericAmount = typeof amount === 'string' ? Number(amount.trim()) : amount;

  // Check if conversion resulted in NaN
  if (isNaN(numericAmount)) {
    return false;
  }

  // Check if it's a finite number (excludes Infinity and -Infinity)
  if (!Number.isFinite(numericAmount)) {
    return false;
  }

  // Check if it's positive (greater than 0)
  if (numericAmount <= 0) {
    return false;
  }

  // Check for reasonable upper bound (1 billion)
  // This prevents unrealistic amounts and potential overflow issues
  if (numericAmount > 1_000_000_000) {
    return false;
  }

  return true;
}
