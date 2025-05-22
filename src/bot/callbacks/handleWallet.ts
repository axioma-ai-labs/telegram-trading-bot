import { hasWallet } from '@/utils/checkUser';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { BotContext } from '@/types/config';
import { walletMessage, walletCreationOKMessage, walletKeyboard } from '@/bot/commands/wallet';
import { WalletService } from '@/services/db/wallet.service';
import { UserService } from '@/services/db/user.service';
import { NeuroDexApi } from '@/services/engine/neurodex';
import logger from '@/config/logger';

export async function handleCreateWallet(ctx: BotContext): Promise<void> {
  try {
    if (!ctx.from?.id) return;

    const telegramId = ctx.from.id.toString();
    const USER_HAS_WALLET = await hasWallet(telegramId);
    const neurodex = new NeuroDexApi();

    if (USER_HAS_WALLET) {
      const user = await UserService.getUserByTelegramId(telegramId);
      if (!user?.id) return;
      const balance = await neurodex.getEthBalance(telegramId);
      const wallets = await WalletService.getWalletsByUserId(user.id);
      const existingWalletMessage = walletMessage(wallets[0].address, balance.data || '0.000');

      await ctx.editMessageText(existingWalletMessage, {
        parse_mode: 'Markdown',
        reply_markup: walletKeyboard,
      });
      return;
    }

    // Get user from database
    const user = await UserService.getUserByTelegramId(telegramId);
    if (!user?.id) return;

    // Create wallet
    const wallet = await neurodex.createWallet();

    // Store wallet
    await WalletService.createWallet({
      address: wallet.address,
      chain: 'ethereum',
      userId: user.id,
      type: 'generated',
    });

    // Success msg
    const editedMessage = await ctx.editMessageText(
      walletCreationOKMessage(wallet.address, wallet.privateKey),
      {
        parse_mode: 'Markdown',
      }
    );

    // delete message after 5 minutes
    if (typeof editedMessage === 'object' && 'message_id' in editedMessage) {
      deleteBotMessage(ctx, editedMessage.message_id, 50000).catch((error) => {
        logger.error('Error in scheduled message deletion:', error);
      });
    }

    logger.info(`Successfully created wallet for user ${telegramId}`);
  } catch (error) {
    logger.error('Error creating wallet:', error);
    await ctx.reply('❌ Error creating wallet. Please try again later.');
  }
}
