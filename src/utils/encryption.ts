import argon2 from 'argon2';
import _sodium from 'libsodium-wrappers';

interface EncryptedData {
  ciphertext: string;
  nonce: string;
  salt: string;
}

/**
 * Utility class for handling encryption and decryption of sensitive data
 * using Argon2id for key derivation and XChaCha20-Poly1305 for encryption
 */
export class EncryptionService {
  /**
   * Argon2id configuration (NIST recommended parameters)
   * - Time cost: 3 iterations
   * - Memory cost: 64MB (resistant to GPU attacks)
   * - Parallelism: 1 (prevents GPU optimization)
   */
  private static readonly argonConfig = {
    type: argon2.argon2id,
    timeCost: 3,
    memoryCost: 65536, // 64MB
    parallelism: 1,
    hashLength: 32, // 256-bit key
  };

  private static sodium: typeof _sodium;
  private static isInitialized = false;

  /**
   * Initialize libsodium
   */
  private static async initialize(): Promise<void> {
    if (!this.isInitialized) {
      await _sodium.ready;
      this.sodium = _sodium;
      this.isInitialized = true;
    }
  }

  /**
   * Derive a key from password using Argon2id
   * @param password - Master password
   * @param salt - Salt for key derivation
   * @returns Derived key suitable for XChaCha20-Poly1305
   */
  private static async deriveKeyFromPassword(
    password: string,
    salt: Uint8Array
  ): Promise<Uint8Array> {
    const rawKey = await argon2.hash(password, {
      ...this.argonConfig,
      salt: Buffer.from(salt),
      raw: true, // Get raw buffer instead of encoded hash
    });
    return new Uint8Array(rawKey);
  }

  /**
   * Encrypt data using XChaCha20-Poly1305
   * @param data - Data to encrypt
   * @param masterPassword - Master password for key derivation
   * @returns Encrypted data with salt and nonce
   */
  static async encrypt(data: string | Buffer, masterPassword: string): Promise<EncryptedData> {
    await this.initialize();

    // Generate a random salt for key derivation
    const salt = this.sodium.randombytes_buf(16);

    // Derive the encryption key from the password
    const key = await this.deriveKeyFromPassword(masterPassword, salt);

    // Generate a random nonce
    const nonce = this.sodium.randombytes_buf(
      this.sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
    );

    try {
      const dataBuffer = Buffer.from(data);
      const ciphertext = this.sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
        dataBuffer,
        null,
        null,
        nonce,
        key,
        'uint8array'
      );

      return {
        ciphertext: Buffer.from(ciphertext).toString('base64'),
        nonce: Buffer.from(nonce).toString('base64'),
        salt: Buffer.from(salt).toString('base64'),
      };
    } finally {
      this.sodium.memzero(key);
    }
  }

  /**
   * Decrypt data using XChaCha20-Poly1305
   * @param encryptedData - Encrypted data package
   * @param masterPassword - Master password for key derivation
   * @returns Decrypted data
   */
  static async decrypt(encryptedData: EncryptedData, masterPassword: string): Promise<Buffer> {
    await this.initialize();

    // Reconstruct the salt and derive the key
    const salt = Buffer.from(encryptedData.salt, 'base64');
    const key = await this.deriveKeyFromPassword(masterPassword, salt);

    const nonce = Buffer.from(encryptedData.nonce, 'base64');
    const ciphertext = Buffer.from(encryptedData.ciphertext, 'base64');

    try {
      const decrypted = this.sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        ciphertext,
        null,
        nonce,
        key,
        'uint8array'
      );
      return Buffer.from(decrypted);
    } finally {
      this.sodium.memzero(key);
    }
  }
}
