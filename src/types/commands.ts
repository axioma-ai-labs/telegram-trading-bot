import { BotContext } from '@/types/config';

// Command handler type
export interface CommandHandler {
  command: string;
  description: string;
  handler: (ctx: BotContext) => Promise<void>;
}
