import { helpKeyboard, helpMessage } from '@/bot/commands/help';
import logger from '@/config/logger';
import { BotContext } from '@/types/telegram';
import { validateUserAndWallet } from '@/utils/userValidation';

export async function handleGetHelp(ctx: BotContext): Promise<void> {
  // validate user
  const { isValid } = await validateUserAndWallet(ctx);
  if (!isValid) return;

  logger.info('Help message:', helpMessage);

  await ctx.editMessageText(helpMessage, {
    parse_mode: 'Markdown',
    reply_markup: helpKeyboard,
  });
}
