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
    await deleteBotMessage(ctx, message.message_id, 5000);
    return false;
  }

  // check if private key matches basic format
  if (!isValidPrivateKey(privateKey)) {
    const message = await ctx.reply(ctx.t('invalid_private_key_msg'));
    await deleteBotMessage(ctx, message.message_id, 5000);
    return false;
  }

  // remove 0x prefix if present
  const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;

  // check length
  if (cleanPrivateKey.length !== 64) {
    const message = await ctx.reply(ctx.t('invalid_private_key_length_msg'));
    await deleteBotMessage(ctx, message.message_id, 5000);
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
