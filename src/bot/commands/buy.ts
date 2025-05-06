import { CommandHandler } from '@/types/commands';
import { BotContext } from '@/types/config';

export const buyTokenMessage = `

Neurobro's pick of the day:

- $BRO | $0.009736 | \`0xc796e499cc8f599a2a8280825d8bda92f7a895e0\`
- $INJ | $9.07 | \`0xe28b3b32b6c345a34ff64674606124dd5aceca30\`
- $FET | $0.641 | \`0xaea46a60368a7bd060eec7df8cba43b7ef41ad85\`

Enter a token symbol or address to buy:`;

export const buyCommandHandler: CommandHandler = {
  command: 'buy',
  description: 'Buy a token',
  handler: async (ctx: BotContext): Promise<void> => {
    await ctx.reply(buyTokenMessage, {
      parse_mode: 'Markdown',
      link_preview_options: {
        is_disabled: true,
      },
    });
  },
};
