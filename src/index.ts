import { createBot } from './bot';
import config from './config/config';

/**
 * Main application entry point.
 */
const main = async (): Promise<void> => {
  try {
    if (config.environment === 'development') {
      console.log(`🚧 Starting ${config.projectName} in ${config.environment} mode...`);
    } else {
      console.log(`🚀 Starting ${config.projectName} in ${config.environment} mode...`);
    }

    // Create and start the bot
    const bot = createBot();

    // Add additional initialization logic here
    // - Database connection
    // - Blockchain services initialization
    // - Trading services initialization

    // Start the bot
    await bot.start();
    console.log('Bot started successfully!');
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
};

// Execute the main function
main();
