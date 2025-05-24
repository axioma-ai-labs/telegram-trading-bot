import { InlineKeyboard } from 'grammy';
import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/config';
import { validateUserAndWallet } from '@/utils/userValidation';

export const transactionsMessage = `
*📈 Transaction History*

*Recent Transactions:*
• Buy: 100,000 BRO at 0.00001 ETH (2024-01-15 14:30)
• Sell: 50,000 BRO at 0.000012 ETH (2024-01-14 09:15) 
• Buy: 75,000 BRO at 0.000009 ETH (2024-01-13 11:45)

View your complete transaction history below.
`;

export const allTransactionsMessage = `
*📈 Complete Transaction History*

*Last 30 Days:*
• Buy: [100,000 BRO at 0.00001 ETH](https://dexscreener.com/base/0x343E3c9be02e5ceCa6CA4461F94D242967870949) (2024-01-15 14:30)     
• Sell: [50,000 BRO at 0.000012 ETH](https://dexscreener.com/base/0x343E3c9be02e5ceCa6CA4461F94D242967870949) (2024-01-14 09:15) 
• Buy: [75,000 BRO at 0.000009 ETH](https://dexscreener.com/base/0x343E3c9be02e5ceCa6CA4461F94D242967870949) (2024-01-13 11:45)    
• Buy: [25,000 BRO at 0.000011 ETH](https://dexscreener.com/base/0x343E3c9be02e5ceCa6CA4461F94D242967870949) (2024-01-12 16:20)
• Sell: [30,000 BRO at 0.000013 ETH](https://dexscreener.com/base/0x343E3c9be02e5ceCa6CA4461F94D242967870949) (2024-01-11 13:10)
• Sell: [50,000 BRO at 0.000012 ETH](https://dexscreener.com/base/0x343E3c9be02e5ceCa6CA4461F94D242967870949) (2024-01-09 15:45)
• Buy: [100,000 BRO at 0.00001 ETH](https://dexscreener.com/base/0x343E3c9be02e5ceCa6CA4461F94D242967870949) (2024-01-10 10:00)

Total Transactions: 7
Volume: 280,000 BRO

`;

export const allTransactionKeyboard = new InlineKeyboard().text('← Back', 'back_transactions');

export const transactionsKeyboard = new InlineKeyboard()
  .text('View All', 'view_all_transactions')
  .row()
  .text('← Back', 'back_wallet');

export const transactionsCommandHandler: CommandHandler = {
  command: 'transactions',
  description: 'View transaction history',
  handler: async (ctx: BotContext): Promise<void> => {
    // validate user
    const { isValid } = await validateUserAndWallet(ctx);
    if (!isValid) return;

    await ctx.reply(transactionsMessage, {
      parse_mode: 'Markdown',
      reply_markup: transactionsKeyboard,
      link_preview_options: {
        is_disabled: true,
      },
    });
  },
};
