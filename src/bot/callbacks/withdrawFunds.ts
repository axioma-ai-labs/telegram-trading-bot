import { BotContext } from '@/types/config';
import { withdrawMessage, withdrawKeyboard } from '@/bot/commands/withdraw';
import { validateUserAndWallet } from '@/utils/userValidation';
import { ViemService } from '@/services/engine/viem.service';

export async function withdrawFunds(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid, user } = await validateUserAndWallet(ctx);
  if (!isValid) return;

  const viemService = new ViemService();
  const ethBalance = await viemService.getNativeBalance(user.wallets[0].address as `0x${string}`);
  const message = withdrawMessage(ethBalance || '0.000');

  await ctx.editMessageText(message, {
    parse_mode: 'Markdown',
    reply_markup: withdrawKeyboard,
    link_preview_options: {
      is_disabled: true,
    },
  });
}
