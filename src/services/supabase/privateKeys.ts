/**
 * @category Services
 */
import { config } from '@/config/config';
import logger from '@/config/logger';
import { supabaseService } from '@/services/supabase/client';
import { EncryptionService } from '@/utils/encryption';

/**
 * Secure private key storage service using Supabase with encryption.
 *
 * Provides encrypted storage and retrieval of blockchain private keys using:
 * - Supabase as the secure backend storage
 * - AES encryption for data protection
 * - Wallet address indexing for quick lookup
 * - Error handling and validation
 *
 * Private keys are never stored in plain text and are always encrypted
 * before being saved to the database.
 *
 * @example
 * ```typescript
 * // Store a private key securely
 * const success = await PrivateStorageService.storePrivateKey(
 *   '0x742d35Cc6Cb3C0532C94c3e66d7E17B9d3d17B9c',
 *   '0x1234567890abcdef...'
 * );
 *
 * // Retrieve a private key
 * const privateKey = await PrivateStorageService.getPrivateKey(
 *   '0x742d35Cc6Cb3C0532C94c3e66d7E17B9d3d17B9c'
 * );
 * ```
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
  static async getPrivateKey(walletAddress: string | null): Promise<string | null> {
    if (!walletAddress) return null;

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
