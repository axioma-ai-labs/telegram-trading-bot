import { walletKeyboard } from '@/bot/commands/wallet';
import logger from '@/config/logger';
import { CoinStatsService } from '@/services/engine/coinstats';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { ViemService } from '@/services/engine/viem';
import { UserService } from '@/services/prisma/user';
import { WalletService } from '@/services/prisma/wallet';
import { PrivateStorageService } from '@/services/supabase/privateKeys';
import { BotContext } from '@/types/telegram';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { invalidateUserCache } from '@/utils/userValidation';

import { startKeyboard } from '../commands/start';

export async function handleCreateWallet(ctx: BotContext): Promise<void> {
  try {
    const telegramId = ctx.from?.id?.toString();
    if (!telegramId) return;

    const user = await UserService.getUserByTelegramId(telegramId);
    if (!user) return;

    const neurodex = new NeuroDexApi();
    const viemService = new ViemService();
    const coinStatsService = CoinStatsService.getInstance();

    // Check if user already has a wallet
    if (user.wallets && user.wallets.length > 0) {
      const walletAddress = user.wallets[0].address as `0x${string}`;

      // Get ETH and token holdings
      const [balance, walletHoldings] = await Promise.all([
        viemService.getNativeBalance(walletAddress),
        coinStatsService.getWalletTokenHoldings(walletAddress, 'base', 0.1),
      ]);

      const ethBalance = balance || '0.000';

      const existingWalletMessage = ctx.t('wallet_msg', {
        walletAddress: user.wallets[0].address,
        totalPortfolioValue: walletHoldings.totalPortfolioValue.toFixed(2),
        ethBalance,
        formattedBalances: walletHoldings.formattedBalances,
      });

      await ctx.editMessageText(existingWalletMessage, {
        parse_mode: 'Markdown',
        reply_markup: walletKeyboard,
        link_preview_options: {
          is_disabled: true,
        },
      });
      return;
    }

    // Create new wallet
    const wallet = await neurodex.createWallet();

    // Store wallet in database
    await WalletService.createWallet({
      address: wallet.address,
      chain: 'ethereum',
      userId: user.id,
      type: 'generated',
    });

    // Store private key securely in Supabase
    const privateKeyStored = await PrivateStorageService.storePrivateKey(
      wallet.address,
      wallet.privateKey
    );

    if (!privateKeyStored) {
      logger.error('Failed to store private key securely');
      await ctx.reply(ctx.t('error_msg'));
      return;
    }

    // Invalidate user cache since wallet was added
    invalidateUserCache(ctx);

    // Show private key and ask for verification
    const message = await ctx.editMessageText(
      ctx.t('wallet_success_msg', {
        walletAddress: wallet.address,
        privateKey: wallet.privateKey,
      }),
      {
        parse_mode: 'Markdown',
      }
    );

    // Delete the private key message after 5 minutes for security
    if (typeof message === 'object' && 'message_id' in message) {
      deleteBotMessage(ctx, message.message_id, 300000).catch((error) => {
        logger.error('Error in scheduled message deletion:', error);
      });
    }

    // Set up private key verification operation
    ctx.session.currentOperation = {
      type: 'pk_verification',
      walletAddress: wallet.address,
    };

    // Ask user to verify private key
    const verificationMessage = await ctx.reply(ctx.t('wallet_repeat_pk_msg'), {
      parse_mode: 'Markdown',
    });

    // Store verification message for later deletion
    ctx.session.currentMessage = {
      messageId: verificationMessage.message_id,
      chatId: ctx.chat?.id || 0,
      type: 'verification',
    };

    logger.info(`Successfully created wallet for user ${telegramId}`);
  } catch (error) {
    logger.error('Error creating wallet:', error);
    await ctx.reply(ctx.t('error_msg'));
  }
}

export async function handleStartTrading(ctx: BotContext): Promise<void> {
  await ctx.editMessageText(ctx.t('start_msg'), {
    parse_mode: 'Markdown',
    reply_markup: startKeyboard,
  });
}
