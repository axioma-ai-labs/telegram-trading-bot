import { EncryptionService } from '@/utils/encryption';

describe('EncryptionService', () => {
  const testPassword = 'test-master-password-12345';
  const testData = 'Hello, this is sensitive data!';

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt data correctly', async () => {
      const encrypted = await EncryptionService.encrypt(testData, testPassword);

      expect(encrypted).toHaveProperty('ciphertext');
      expect(encrypted).toHaveProperty('nonce');
      expect(encrypted).toHaveProperty('salt');

      const decrypted = await EncryptionService.decrypt(encrypted, testPassword);
      expect(decrypted.toString()).toBe(testData);
    });

    it('should encrypt data to different ciphertext each time (due to random salt/nonce)', async () => {
      const encrypted1 = await EncryptionService.encrypt(testData, testPassword);
      const encrypted2 = await EncryptionService.encrypt(testData, testPassword);

      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
      expect(encrypted1.nonce).not.toBe(encrypted2.nonce);
      expect(encrypted1.salt).not.toBe(encrypted2.salt);
    });

    it('should handle Buffer input', async () => {
      const bufferData = Buffer.from(testData);
      const encrypted = await EncryptionService.encrypt(bufferData, testPassword);
      const decrypted = await EncryptionService.decrypt(encrypted, testPassword);

      expect(decrypted.toString()).toBe(testData);
    });

    it('should fail to decrypt with wrong password', async () => {
      const encrypted = await EncryptionService.encrypt(testData, testPassword);

      await expect(EncryptionService.decrypt(encrypted, 'wrong-password')).rejects.toThrow();
    });

    it('should handle empty string', async () => {
      const encrypted = await EncryptionService.encrypt('', testPassword);
      const decrypted = await EncryptionService.decrypt(encrypted, testPassword);

      expect(decrypted.toString()).toBe('');
    });

    it('should handle unicode characters', async () => {
      const unicodeData = 'Hello! Привет! 你好! Emoji: 🚀💰';
      const encrypted = await EncryptionService.encrypt(unicodeData, testPassword);
      const decrypted = await EncryptionService.decrypt(encrypted, testPassword);

      expect(decrypted.toString()).toBe(unicodeData);
    });

    it('should handle large data', async () => {
      const largeData = 'x'.repeat(10000);
      const encrypted = await EncryptionService.encrypt(largeData, testPassword);
      const decrypted = await EncryptionService.decrypt(encrypted, testPassword);

      expect(decrypted.toString()).toBe(largeData);
    });
  });

  describe('encrypted data structure', () => {
    it('should produce base64-encoded ciphertext, nonce, and salt', async () => {
      const encrypted = await EncryptionService.encrypt(testData, testPassword);

      // Verify base64 format
      expect(() => Buffer.from(encrypted.ciphertext, 'base64')).not.toThrow();
      expect(() => Buffer.from(encrypted.nonce, 'base64')).not.toThrow();
      expect(() => Buffer.from(encrypted.salt, 'base64')).not.toThrow();
    });

    it('should produce ciphertext longer than input (due to auth tag)', async () => {
      const encrypted = await EncryptionService.encrypt(testData, testPassword);
      const ciphertextBuffer = Buffer.from(encrypted.ciphertext, 'base64');

      // XChaCha20-Poly1305 adds 16-byte auth tag
      expect(ciphertextBuffer.length).toBeGreaterThan(testData.length);
    });
  });
});
