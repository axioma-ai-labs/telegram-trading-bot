import { InlineKeyboard } from 'grammy';
import { BotContext } from '@/types/config';
import { CommandHandler } from '@/types/commands';

export const helpMessage = `
*Help & Support*

*Quick Start:*
• /start - Start the bot
• /wallet - Manage your wallet
• /buy - Buy crypto tokens
• /sell - Sell crypto tokens
• /settings - Configure bot settings

*How do I use Neurodex?*
Check out our [documentation](https://docs.neurodex.xyz) where we explain everything in detail. Join our support chat for additional resources.

*💰 Where can I find my referral code?*
Open the /referrals menu to view your unique referral code. Share it with friends to earn rewards!

*What are the fees?*
• Trading fee: 1% per successful transaction
• No subscription fees
• No hidden charges
• All features are free to use

*🔒 Security Tips:*
• NEVER share your private keys or seed phrases
• Admins will NEVER DM you first
• Use only official links from our website
• We never store your private keys or seed phrases. When generating a new wallet - store your private key somewhere safe.

*💡 Trading Tips:*
Common issues and solutions:
• Slippage Exceeded: Increase slippage or trade in smaller amounts
• Insufficient balance: Add more funds or reduce transaction amount
• Transaction timeout: Increase gas tip during high network load

*Need more help?*
Contact our support team by clicking the button below.

`;

export const helpKeyboard = new InlineKeyboard()
  .url('📞 Contact us', 'https://t.me/neurodex_support')
  .row()
  .text('← Back', 'back_start');

export const helpCommandHandler: CommandHandler = {
  command: 'help',
  description: 'Get help',
  handler: async (ctx: BotContext): Promise<void> => {
    ctx.session.lastInteractionTime = Date.now();

    await ctx.reply(helpMessage, {
      parse_mode: 'Markdown',
      reply_markup: helpKeyboard,
    });
  },
};
