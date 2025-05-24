import { deleteBotMessage } from '@/utils/deleteMessage';
import { BotContext } from '@/types/config';
import { walletMessage, walletCreationOKMessage, walletKeyboard } from '@/bot/commands/wallet';
import { WalletService } from '@/services/db/wallet.service';
import { UserService } from '@/services/db/user.service';
import { NeuroDexApi } from '@/services/engine/neurodex';
import { ViemService } from '@/services/engine/viem.service';
import { invalidateUserCache } from '@/utils/userValidation';

export async function handleCreateWallet(ctx: BotContext): Promise<void> {
  try {
    const telegramId = ctx.from?.id?.toString();
    if (!telegramId) return;

    const user = await UserService.getUserByTelegramId(telegramId);
    if (!user) return;

    const neurodex = new NeuroDexApi();
    const viemService = new ViemService();

    // Check if user already has a wallet
    if (user.wallets && user.wallets.length > 0) {
      const balance = await viemService.getNativeBalance(user.wallets[0].address as `0x${string}`);
      const ethBalance = balance || '0.000';

      const existingWalletMessage = walletMessage(user.wallets[0].address, ethBalance);

      await ctx.editMessageText(existingWalletMessage, {
        parse_mode: 'Markdown',
        reply_markup: walletKeyboard,
      });
      return;
    }

    // Create new wallet
    const wallet = await neurodex.createWallet();

    // Store wallet
    await WalletService.createWallet({
      address: wallet.address,
      chain: 'ethereum',
      userId: user.id,
      type: 'generated',
      encryptedPrivateKey: wallet.privateKey,
    });

    // Invalidate user cache since wallet was added
    invalidateUserCache(ctx);

    // Success msg
    const editedMessage = await ctx.editMessageText(
      walletCreationOKMessage(wallet.address, wallet.privateKey),
      {
        parse_mode: 'Markdown',
      }
    );

    // Delete message after 5 minutes
    if (typeof editedMessage === 'object' && 'message_id' in editedMessage) {
      deleteBotMessage(ctx, editedMessage.message_id, 50000).catch((error) => {
        console.error('Error in scheduled message deletion:', error);
      });
    }

    console.log(`Successfully created wallet for user ${telegramId}`);
  } catch (error) {
    console.error('Error creating wallet:', error);
    await ctx.reply('❌ Error creating wallet. Please try again later.');
  }
}
