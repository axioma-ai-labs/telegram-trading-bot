import { InlineKeyboard } from 'grammy';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/telegram';
import { ViemService } from '@/services/engine/viem.service';
import { validateUserAndWallet } from '@/utils/userValidation';
import logger from '@/config/logger';

export const depositMessage = (
  walletAddress: string,
  ethBalance: string
): string => `📥 *Deposit ETH or Tokens*

ETH: ${ethBalance}    

Send ETH or any ERC-20 token to your wallet: \`${walletAddress}\`

*Important*:
- Only send assets on the Base Network
- ETH deposits usually confirm within minutes
- Never share your private key with anyone`;

export const depositKeyboard = new InlineKeyboard()
  .text('← Back', 'back_start')
  .text('↺ Refresh', 'refresh_deposit');

export const depositCommandHandler: CommandHandler = {
  command: 'deposit',
  description: 'Display your wallet address for deposits',
  handler: async (ctx: BotContext): Promise<void> => {
    // validate user
    const { isValid, user } = await validateUserAndWallet(ctx);
    if (!isValid || !user) return;

    const viemService = new ViemService();
    const balance = await viemService.getNativeBalance(user?.wallets[0].address as `0x${string}`);
    const ethBalance = balance || '0.000';
    const message = depositMessage(user.wallets[0].address, ethBalance);

    logger.info('Deposit message:', message);

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: depositKeyboard,
      link_preview_options: {
        is_disabled: true,
      },
    });
  },
};

export default depositCommandHandler;
