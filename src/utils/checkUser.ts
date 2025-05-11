import { UserService } from '@/services/db/user.service';
import { WalletService } from '@/services/db/wallet.service';

export async function isUserRegistered(telegramId: string): Promise<boolean> {
  const user = await UserService.getUserByTelegramId(telegramId);
  return user !== null;
}

export async function hasWallet(telegramId: string): Promise<boolean> {
  const user = await UserService.getUserByTelegramId(telegramId);
  if (!user) return false;

  const wallets = await WalletService.getWalletsByUserId(user.id);
  return wallets.length > 0;
}

export async function isTermsConditionsAccepted(telegramId: string): Promise<boolean> {
  const user = await UserService.getUserByTelegramId(telegramId);
  return user?.termsAccepted ?? false;
}
