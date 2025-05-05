import { BotContext } from '../../types/config';
import { CommandHandler } from '../../types/commands';

const helpMessage = `
*Neurotrading Bot Help*

Welcome to Neurotrading Bot - your lightning fast trading bot for crypto!

*📋 Available Commands:*
• /start - Start the bot
• /help - Show this help message
• /trade - Start trading (coming soon)
• /settings - Configure your preferences (coming soon)
• /wallet - Manage your wallets (coming soon)
• /status - Check your account status (coming soon)

*🚀 How to Use:*
1. Start by connecting your wallet
2. Set your trading preferences
3. Choose your trading pairs
4. Set risk parameters
5. Begin trading with /trade

*📞 Support:*
For assistance, contact @iamspacecreated on Telegram.

*🔐 Security:*
All wallet data is encrypted with military-grade encryption. We never store your private keys - they are stored on your device.
`;

export const helpCommandHandler: CommandHandler = {
  command: 'help',
  description: 'Get help',
  handler: async (ctx: BotContext): Promise<void> => {
    ctx.session.lastInteractionTime = Date.now();

    await ctx.reply(helpMessage, {
      parse_mode: 'Markdown',
    });
  },
};
