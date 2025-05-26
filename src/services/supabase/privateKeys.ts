import { config } from '@/config/config';
import logger from '@/config/logger';
import { supabaseService } from '@/services/supabase/client';
import { EncryptionService } from '@/utils/encryption';

/**
 * Service for securely storing and retrieving private keys
 * Uses Supabase for storage and Argon2id + XChaCha20-Poly1305 for encryption
 */
export class PrivateStorageService {
  private static readonly TABLE_NAME = 'private_keys';

  /**
   * Store an encrypted private key for a wallet address
   * @param walletAddress - The wallet address
   * @param privateKey - The private key to encrypt and store
   * @returns True if storage was successful
   */
  static async storePrivateKey(walletAddress: string, privateKey: string): Promise<boolean> {
    try {
      const encrypted = await EncryptionService.encrypt(
        privateKey,
        config.encryption.masterPassword
      );

      const { error } = await supabaseService.from(this.TABLE_NAME).upsert({
        wallet_address: walletAddress.toLowerCase(),
        encrypted_private_key: JSON.stringify(encrypted),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error storing private key:', error);
      return false;
    }
  }

  /**
   * Retrieve and decrypt a private key for a wallet address
   * @param walletAddress - The wallet address
   * @returns The decrypted private key or null if not found
   */
  static async getPrivateKey(walletAddress: string): Promise<string | null> {
    try {
      const { data, error } = await supabaseService
        .from(this.TABLE_NAME)
        .select('encrypted_private_key')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single();

      if (error || !data) return null;

      const encrypted = JSON.parse(data.encrypted_private_key);
      const decrypted = await EncryptionService.decrypt(
        encrypted,
        config.encryption.masterPassword
      );

      return decrypted.toString();
    } catch (error) {
      logger.error('Error retrieving private key:', error);
      return null;
    }
  }

  /**
   * Delete a private key record for a wallet address
   * @param walletAddress - The wallet address
   * @returns True if deletion was successful
   */
  static async deletePrivateKey(walletAddress: string): Promise<boolean> {
    try {
      const { error } = await supabaseService
        .from(this.TABLE_NAME)
        .delete()
        .eq('wallet_address', walletAddress.toLowerCase());

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error deleting private key:', error);
      return false;
    }
  }
}
