import { startTradingKeyboard } from '@/bot/commands/start';
import { PrivateStorageService } from '@/services/supabase/privateKeys';
import { BotContext, OperationState } from '@/types/telegram';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { validateUserAndWallet } from '@/utils/userValidation';

/**
 * Handles private key verification messages from users.
 *
 * This function processes user input for private key verification during
 * wallet creation, validating that the user has correctly stored their
 * private key by asking them to enter the last 4 characters.
 *
 * @param ctx - The bot context containing session and message data
 * @param userInput - The user's text input (last 4 characters of private key)
 * @param currentOperation - The current operation from session
 */
export async function handlePkVerificationMessages(
  ctx: BotContext,
  userInput: string,
  _currentOperation: OperationState
): Promise<void> {
  try {
    // Validate user and get wallet
    const { isValid, user } = await validateUserAndWallet(ctx, { skipMessages: true });
    if (!isValid || !user?.wallets?.[0]) {
      await ctx.reply(ctx.t('no_wallet_msg'));
      return;
    }

    const walletAddress = user.wallets[0].address;

    // Get private key from secure storage
    const privateKey = await PrivateStorageService.getPrivateKey(walletAddress);
    if (!privateKey) {
      await ctx.reply(ctx.t('no_private_key_msg'));
      return;
    }

    // Validate input format (should be 4 hexadecimal characters)
    const inputChars = userInput.trim().toLowerCase();
    if (!/^[0-9a-f]{4}$/.test(inputChars)) {
      const message = await ctx.reply(ctx.t('wallet_repeat_pk_error_msg'));
      await deleteBotMessage(ctx, message.message_id, 3000);
      return;
    }

    // Get last 4 characters
    const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    const last4Chars = cleanPrivateKey.slice(-4).toLowerCase();

    // Verify
    if (inputChars === last4Chars) {
      // Success
      ctx.session.currentOperation = null;

      // delete verification message
      if (ctx.session.currentMessage?.type === 'verification') {
        await deleteBotMessage(ctx, ctx.session.currentMessage.messageId);

        ctx.session.currentMessage = null;
      }

      await ctx.reply(ctx.t('wallet_repeat_pk_success_msg'), {
        parse_mode: 'Markdown',
        reply_markup: startTradingKeyboard,
        link_preview_options: {
          is_disabled: true,
        },
      });
    } else {
      // Failed verification - ask to try again
      const message = await ctx.reply(ctx.t('wallet_repeat_pk_error_msg'));
      await deleteBotMessage(ctx, message.message_id, 3000);
    }
  } catch (error) {
    console.error('Error in private key verification:', error);
    await ctx.reply(ctx.t('error_msg'));
  }
}
