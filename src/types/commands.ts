import { BotContext } from '@/types/telegram';

// Command handler type
export interface CommandHandler {
  command: string;
  description: string;
  handler: (ctx: BotContext) => Promise<void>;
}
