# Learnings

Summary of learnings for Neurodex trading bot. Kinda super important!

## 🔐 Security Learnings

* **Use AES-256-GCM instead of AES-256-CBC**
  GCM provides both confidentiality and integrity (auth tag) and is resistant to padding oracle attacks.

* **Always use a random Initialization Vector (IV)**
  For GCM mode, a 12-byte IV (`crypto.randomBytes(12)`) is recommended and must be unique per encryption.

* **Derive encryption key using SHA-256**
  Use `crypto.createHash('sha256').update(secret).digest()` to produce a fixed-length 256-bit key from your secret.

* **Store IV and Auth Tag with encrypted data**
  Concatenate them in a predictable format (e.g., `iv:authTag:encrypted`) so they can be reused during decryption.

* **Keep private keys encrypted at all times**
  Never store or log raw private keys. Decrypt them only when absolutely needed and clear from memory after use.

* **Use strong, unpredictable secrets**
  Your `encryptionKey` should be at least 32 characters long, random, and not reused across environments.

* **Implement proper key rotation (for the future)**
  Design your system to support periodic key changes without data loss. Use versioned encryption keys if needed.

* **Limit exposure window**
  Auto-delete private keys within a short time (e.g., 5 minutes).

* **Upscale the database**
  In the beginning we can use any db, but in the future we might face scaling issues. E.g. 20 active users and each user makes some settings request. This converts to 20 requests per second. 
  The solution is to upscale the database, and most importantly, allow concurrent connections. This is not so easy as it sounds, so using 3-rd party service like Accelerate is a good idea. 
  We already activated it in Development environment, so this should be a good example to follow.

* **Onchain is fucking hard**
  Finding is quite simple: onchain staff is poorly documented, relatively complex and not very-well maintained. Unfortunately third-party providers also don't help much...

  Very important finding is, that third-party providers just prepare transactions/contracts/etc., but the execution is done on the node via viem (or similar library).

  Also how openocean contract is being found from the viem is still a holy mystery... 