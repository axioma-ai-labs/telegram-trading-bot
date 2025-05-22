import { GoldRushClient } from '@covalenthq/client-sdk';
import { config } from '../src/config/config';
import logger from '../src/config/logger';

const walletAddress = '0xc7C86BaDa2d114960A4729772d3FDDdb342cc7Fb';

// Check balance for a single chain
const ApiServices = async (): Promise<void> => {
  const client = new GoldRushClient(config.covalenthq_api_key);
  const resp = await client.BalanceService.getTokenBalancesForWalletAddress(
    'base-mainnet',
    walletAddress
  );
  logger.info(resp.data);
};

// Check balance multichains
const MultiChainApiServices = async (): Promise<void> => {
  const client = new GoldRushClient(config.covalenthq_api_key);
  const resp = await client.AllChainsService.getMultiChainBalances(walletAddress, {
    quoteCurrency: 'USD',
    limit: 10,
  });
  logger.info(resp.data);
};

ApiServices();
MultiChainApiServices();
