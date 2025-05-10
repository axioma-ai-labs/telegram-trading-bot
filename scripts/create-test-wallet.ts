import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import crypto from 'crypto';
import { config } from '../src/config/config';

// --- Wallet creation ---
export function createWallet(): { address: string; privateKey: string } {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  return {
    address: account.address,
    privateKey,
  };
}

// --- Secure Encryption (AES-256-GCM) ---
export function encryptPrivateKey(privateKey: string): string {
  const iv = crypto.randomBytes(12); // GCM recommends 12 bytes
  const key = crypto.createHash('sha256').update(config.wallet.encryptionKey).digest();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([cipher.update(privateKey, 'utf8'), cipher.final()]);

  const authTag = cipher.getAuthTag();

  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

// --- Secure Decryption (AES-256-GCM) ---
export function decryptPrivateKey(encrypted: string): string {
  const [ivHex, tagHex, dataHex] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const data = Buffer.from(dataHex, 'hex');
  const key = crypto.createHash('sha256').update(config.wallet.encryptionKey).digest();

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);

  return decrypted.toString('utf8');
}

// // --- Test ---
// // Uncomment to test the wallet creation and encryption/decryption:
// const wallet = createWallet();
// console.log('Address:', wallet.address);
// console.log('Private Key:', wallet.privateKey);

// const encrypted = encryptPrivateKey(wallet.privateKey);
// console.log('Encrypted Private Key:', encrypted);

// const decrypted = decryptPrivateKey(encrypted);
// console.log('Decrypted:', decrypted);
