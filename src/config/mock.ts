/* ───── Session / onboarding ───────────────────────────── */
export const IS_NEW_USER = false; // user never seen before
export const USER_HAS_WALLET = true; // wallet row exists for user
export const USER_HAS_BALANCE = true; // wallet balance > 0
export const USER_HAS_TRANSACTIONS = true; // at least one past trade

/* ───── Input validation ───────────────────────────────── */
export const INVALID_TOKEN_ADDRESS = false; // user pasted bad 0x address
export const UNKNOWN_TOKEN_SYMBOL = false; // symbol not in lookup table
export const INVALID_AMOUNT_FORMAT = false; // user typed "abc" or "-1"
export const AMOUNT_EXCEEDS_BALANCE = false; // user tried 999 ETH w/ 1 ETH bal

/* ───── Quote / gas params mock failures ───────────────── */
export const QUOTE_API_FAIL = false; // OpenOcean /quote 4xx/5xx
export const GAS_API_FAIL = false; // Gas-estimation endpoint fail

/* ───── Confirmation edge cases ────────────────────────── */
export const USER_CANCELS_TRADE = false; // clicks "No" on confirmation
export const USER_TIMEOUT_ON_CONFIRM = false; // never clicks; session expires

/* ───── Swap execution outcomes ────────────────────────── */
export const TX_SIMULATED_REJECT = false; // user rejects signing in wallet
export const TX_BROADCAST_ERROR = false; // eth_sendRawTransaction fails
export const TX_RECEIPT_FAILURE = false; // status = 0 (revert)
export const TX_RECEIPT_SUCCESS = true; // status = 1

/* ───── Database / storage glitches ────────────────────── */
export const DB_SAVE_FAIL = false; // saveTransaction throws
export const ENCRYPTION_DECRYPTION_FAIL = false; // wallet decrypt error

/* ───── Misc UX paths ──────────────────────────────────── */
export const INVALID_SLIPPAGE_SETTING = false; // user set 0 or >100
export const INVALID_GAS_PRIORITY_CHOICE = false; // user picks unsupported level
export const TRY_BUY_UNLISTED_CUSTOM_TOK = false; // tokenInfo lookup returns null
