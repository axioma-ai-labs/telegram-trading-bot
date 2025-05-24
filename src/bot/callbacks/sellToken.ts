import { BotContext } from '@/types/config';
import { sellTokenMessage } from '@/bot/commands/sell';
import { validateUserAndWallet } from '@/utils/userValidation';

export async function sellToken(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid } = await validateUserAndWallet(ctx);
  if (!isValid) return;

  await ctx.reply(sellTokenMessage, {
    parse_mode: 'Markdown',
  });
}
