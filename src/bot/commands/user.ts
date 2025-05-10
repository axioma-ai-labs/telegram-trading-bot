import { CommandHandler } from '../../types/commands';
import { BotContext } from '../../types/config';

const formatUserInfo = (ctx: BotContext): string => {
  const user = ctx.from;
  if (!user) return '❌ No user information available';

  return `
*👤 User Information*

*Basic Info:*
• Telegram ID: \`${user.id}\`
• Username: ${user.username ? `@${user.username}` : 'Not set'}
• First Name: ${user.first_name}
• Last Name: ${user.last_name || 'Not set'}
• Language Code: ${user.language_code || 'Not set'}

*Additional Info:*
• Is Bot: ${user.is_bot ? 'Yes' : 'No'}
• Premium: ${user.is_premium ? 'Yes' : 'No'}

*Session Info:*
• Last Interaction: ${new Date(ctx.session.lastInteractionTime).toLocaleString()}
• Start Time: ${new Date(ctx.session.startTime).toLocaleString()}
`;
};

export const userCommandHandler: CommandHandler = {
  command: 'user',
  description: 'Display user information',
  handler: async (ctx: BotContext): Promise<void> => {
    await ctx.reply(formatUserInfo(ctx), {
      parse_mode: 'Markdown',
    });
  },
};
