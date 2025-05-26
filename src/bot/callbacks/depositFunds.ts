import { depositKeyboard, depositMessage } from '@/bot/commands/deposit';
import logger from '@/config/logger';
import { ViemService } from '@/services/engine/viem.service';
import { BotContext } from '@/types/telegram';
import { validateUserAndWallet } from '@/utils/userValidation';

export async function depositFunds(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid, user } = await validateUserAndWallet(ctx);
  if (!isValid || !user) return;

  const viemService = new ViemService();
  const balance = await viemService.getNativeBalance(user.wallets[0].address as `0x${string}`);
  const ethBalance = balance || '0.000';
  const message = depositMessage(user.wallets[0].address, ethBalance);

  logger.info('Deposit funds message:', message);

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: depositKeyboard,
    link_preview_options: {
      is_disabled: true,
    },
  });
}
