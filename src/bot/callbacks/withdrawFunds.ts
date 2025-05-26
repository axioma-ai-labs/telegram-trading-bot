import { withdrawKeyboard, withdrawMessage } from '@/bot/commands/withdraw';
import logger from '@/config/logger';
import { ViemService } from '@/services/engine/viem.service';
import { BotContext } from '@/types/telegram';
import { validateUserAndWallet } from '@/utils/userValidation';

export async function withdrawFunds(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid, user } = await validateUserAndWallet(ctx);
  if (!isValid || !user) return;

  const viemService = new ViemService();
  const ethBalance = await viemService.getNativeBalance(user?.wallets[0].address as `0x${string}`);
  const message = withdrawMessage(ethBalance || '0.000');

  logger.info('Withdraw funds message:', message);

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: withdrawKeyboard,
    link_preview_options: {
      is_disabled: true,
    },
  });
}
