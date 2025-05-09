import { hasWallet } from '@/utils/checkUser';
import { deleteBotMessage } from '@/utils/deleteMessage';
import { BotContext } from '@/types/config';
import {
  walletMessage,
  walletCreationOKMessage,
  walletKeyboard,
  depositKeyboard,
} from '../commands/wallet';
import { WalletService } from '@/services/db/wallet.service';
import { UserService } from '@/services/db/user.service';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

// Wallet creation helper
function createWallet(): { address: string; privateKey: string } {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  return {
    address: account.address,
    privateKey,
  };
}

export async function handleCreateWallet(ctx: BotContext): Promise<void> {
  if (!ctx.from?.id) return;

  const telegramId = ctx.from.id.toString();
  const USER_HAS_WALLET = await hasWallet(telegramId);

  if (USER_HAS_WALLET) {
    await ctx.editMessageText(walletMessage, {
      parse_mode: 'Markdown',
      reply_markup: walletKeyboard,
    });
    return;
  }

  const { address, privateKey } = createWallet();
  const user = await UserService.getUserByTelegramId(telegramId);

  if (!user?.id) return;

  await WalletService.createWallet({
    address,
    chain: 'ethereum',
    userId: user.id,
    type: 'generated',
  });

  const editedMessage = await ctx.editMessageText(
    walletCreationOKMessage.replace('{walletAddress}', address).replace('{privateKey}', privateKey),
    {
      parse_mode: 'Markdown',
      reply_markup: depositKeyboard,
    }
  );

  if (
    typeof editedMessage === 'object' &&
    editedMessage !== null &&
    'message_id' in editedMessage
  ) {
    await deleteBotMessage(ctx, editedMessage.message_id);
  }
}
