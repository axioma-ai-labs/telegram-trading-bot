import { hasWallet } from '@/utils/checkUser';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { BotContext } from '@/types/config';
import { walletMessage, walletCreationOKMessage, walletKeyboard } from '../commands/wallet';
import { WalletService } from '@/services/db/wallet.service';
import { UserService } from '@/services/db/user.service';
import { NeuroDexApi } from '@/services/engine/neurodex';

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
      const existingWalletMessage = walletMessage
        .replace('{ethBalance}', balance.data || '0.000')
        .replace('{walletAddress}', wallets[0].address);

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
      walletCreationOKMessage
        .replace('{walletAddress}', wallet.address)
        .replace('{privateKey}', wallet.privateKey),
      {
        parse_mode: 'Markdown',
      }
    );

    if (typeof editedMessage === 'object' && 'message_id' in editedMessage) {
      await deleteBotMessage(ctx, editedMessage.message_id, 30000);
    }

    console.log(`Successfully created wallet for user ${telegramId}`);
  } catch (error) {
    console.error('Error creating wallet:', error);
    await ctx.reply('❌ Error creating wallet. Please try again later.');
  }
}
