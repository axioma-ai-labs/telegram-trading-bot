# start
start_msg =
    💸 *Neurodex*

    Neurodex is your lightning fast crypto trading bot.

    Buy and sell crypto, create DCA orders, set up limit orders with ease using Neurodex.

    Neurodex currently supports trading on *Base*, *BSC* & *Ethereum*.

    /buy - Buy crypto tokens
    /sell - Sell crypto tokens
    /dca - Create DCA order
    /limit - Create limit order
    /orders - View your limit & DCA orders
    /wallet - Manage your wallet
    /settings - Personalize your bot settings
    /help - Get help & support

    ⚡ Powered by [Neurobro](https://neurobro.ai) and [Docs](https://docs.neurodex.xyz)

# terms & conditions
accept_terms_conditions_msg =
    💸 *Welcome to Neurodex*

    Before we get started, please review and accept our terms of service & privacy policy.

    • [Terms of Service](https://docs.neurodex.xyz/terms-of-service)
    • [Privacy Policy](https://docs.neurodex.xyz/privacy-policy)


# wallet
wallet_create_msg =
    💸 *Neurodex*

    Neurodex is your lightning fast crypto trading bot

    To be able to /buy, /sell or do any other actions, you have to create a wallet first. Create one now by clicking the button below.

    For any help setting up please refer to [this guide](https://docs.neurodex.xyz/getting-started/setup) or get /help.



wallet_fail_msg =
    ❌ *Wallet Creation Failed*

    Something went wrong. Please try again or go to /help.

wallet_msg =
    💰 *Portfolio Overview* 

    📊 *Total Value:* ${ $totalPortfolioValue }

    • *ETH Balance:* { $ethBalance } ETH

    • *Token Holdings:*
    { $formattedBalances }

    Discover deeper insights and market alpha at [Neurobro](https://neurobro.ai)

wallet_repeat_pk_error_msg = ❌ *Private Key Verification Failed*
    
    The last 4 characters you entered do not match your private key. Please try again below:

wallet_repeat_pk_msg = ⚠️ *Verify Private Key* 

    Please enter the last 4 characters of your private key below to verify you remembered & stored it securely:

wallet_repeat_pk_success_msg = ✅ *Private Key Verified*

    Your private key has been verified successfully.

    To start trading, use the /start command or click the button below:


wallet_success_msg =
    ✅ *Your wallet has been created successfully*

    • *Wallet Address:* `{ $walletAddress }`

    • *Private Key:* `{ $privateKey }`

    ⚠️ *IMPORTANT:* Keep your private key safe and secure
    • Do not share it with anyone
    • Do not store it digitally or online
    • Write it down and store it safely

    ⏰ This message will be deleted in 5 minutes for security

    To start trading, use the /start command.


# error & status messages
error_msg = ❌ Something went wrong. Please try again.
insufficient_funds_msg =
    ⚠️ Insufficient funds to complete the transaction.

    Please ensure you have enough ETH to cover:
    • The transaction amount
    • Gas fees
invalid_amount_msg = ⚠️ Invalid amount selected. Please try selecting a different amount.
invalid_token_msg = ⚠️ No token selected. Please select a token first.
invalid_price_msg = ⚠️ Invalid price selected. Please select a different price
no_wallet_msg = ⚠️ You don't have a wallet. Please create one using /wallet or click the button below:
no_private_key_msg = ⚠️ Private key not found. Please try again or contact support.
already_up_to_date_msg = ✨ Already up to date!
rate_limit_second_msg = Please slow down! Maximum 3 requests per second.
rate_limit_minute_msg = You have exceeded the limit of 50 requests per minute. Please wait.
rate_limit_15min_msg = You have exceeded the limit of 300 requests per 15 minutes. Please wait.
token_not_found_msg = ❌ Token not found. Please check the token contract address and try again.

# dca
dca_cancel_msg = ⭕ DCA order has been successfully cancelled!
dca_confirm_msg =
    🔍 *Confirm DCA Order*

    Token: { $tokenSymbol } | { $tokenName }
    CA: `{ $token }`
    Amount: { $amount } ETH
    Interval: { $interval }
    Times: { $times }

    Please confirm to create the DCA order:

dca_custom_amount_msg = Please enter the amount of ETH you want to spend on your DCA order:
dca_custom_interval_msg = Please enter the interval in hours for your DCA order:
dca_custom_times_msg = Please enter the number of times (1-100) for your DCA order:
dca_interval_msg = Please select the interval time for your DCA order:
dca_invalid_interval_msg = ⚠️ Invalid interval selected. Please select a different interval.
dca_invalid_times_msg = ⚠️ Invalid number of times. Please enter a number between 1 and 100.
dca_no_orders_msg = No active DCA orders found.

dca_orders_found_msg = ✅ DCA orders found.
dca_success_msg =
    🎊 *Congratulations! Your DCA order has been created successfully!*

    Token: { $tokenSymbol } | { $tokenName }
    CA: `{ $token }`
    Amount: { $amount } ETH
    Interval: { $interval }
    Times: { $times }

    You can view your open DCA orders using /orders!

dca_times_msg = Please select the number of times for your DCA order:
dca_token_found_msg =
    ✅ *Token Found*

    Symbol: *{ $tokenSymbol }*
    Name: *{ $tokenName }*
    Price: *{ $tokenPrice }*
    Chain: { $tokenChain }

    Please select how much ETH you want to spend on { $tokenSymbol } for your DCA order.

    Go to /settings to adjust slippage and gas if the transaction fails.

dca_token_msg = Enter token contract address for DCA:

# deposit & withdraw
deposit_msg =
    📥 *Deposit ETH or Tokens*

    💰 *Wallet:* `{ $walletAddress }`

    📊 *Total Portfolio Value:* ${ $totalPortfolioValue }

    🔹 *ETH Balance:* { $ethBalance } ETH

    🔹 *Token Balances:*
    { $formattedBalances }

    Important:
    - Only send assets on the Base Network
    - ETH deposits usually confirm within minutes
    - Never share your private key with anyone

withdraw_select_amount_msg =
    📤 *Withdraw ETH*

    Your balance: { $ethBalance } ETH

    Please select how much ETH you want to withdraw:

    Important:
    - Double check the receiving address
    - Withdrawals usually confirm within minutes
    - Never share your private key with anyone

withdraw_custom_amount_msg = Please enter the amount of ETH you want to withdraw:
withdraw_recipient_address_msg = Please enter the recipient wallet address (0x...):
withdraw_insufficient_balance_msg = ⚠️ Insufficient balance. You only have { $balance } ETH but want to withdraw { $amount } ETH.
withdraw_invalid_operation_msg = ⚠️ Invalid withdrawal operation. Please try again.
withdraw_error_msg = ❌ Something went wrong during the withdrawal. Please try again.
withdraw_cancel_msg = ⭕ Withdrawal has been cancelled.
invalid_address_msg = ⚠️ Invalid address format. Please enter a valid Ethereum address starting with 0x.
invalid_input_msg = ⚠️ Invalid input. Please try again.

withdraw_confirm_msg =
    🔍 *Confirm Withdrawal*

    Amount: *{ $amount } ETH*
    To Address: `{ $recipientAddress }`

    Are you sure you want to proceed with this withdrawal?

withdraw_success_msg =
    🎊 *Withdrawal Successful!*

    Amount: { $amount } ETH
    To Address: `{ $recipientAddress }`
    Transaction: https://basescan.org/tx/{ $txHash }

    Your withdrawal has been submitted to the network and should confirm within minutes.

    Check your transaction on [BaseScan](https://basescan.org/tx/{ $txHash })

# sell
sell_cancel_msg = ⭕ Sell order has been successfully cancelled!

sell_confirm_msg =
    🔍 *Confirm Sell Order*

    Token: *{ $tokenSymbol }* | { $tokenName }
    CA: `{ $tokenAddress }`
    Amount: *{ $amount } { $tokenSymbol }*

    Are you sure you want to proceed with this sale?

sell_custom_amount_msg = Please enter the amount of tokens you want to sell:
sell_error_msg = ❌ Something went wrong during the sell operation. Please try again.
sell_insufficient_balance_msg = ⚠️ Insufficient balance. You only have { $balance } { $tokenSymbol }.
sell_invalid_operation_msg = ⚠️ Invalid sell operation. Please try again.
sell_no_balance_msg = ⚠️ You have no balance of this token to sell.
sell_success_msg =
    🎊 *Congratulations! Your sell order for { $amount } { $tokenSymbol } has been created successfully!*

    Transaction details:
    • Amount: { $amount } { $tokenSymbol }
    • Token: { $token }
    • Transaction: https://basescan.org/tx/{ $txHash }

sell_token_found_msg = 
    ✅ *Token Found*

    Symbol: *{ $tokenSymbol }*
    Name: *{ $tokenName }*
    Price: *{ $tokenPrice }*
    Chain: { $tokenChain }

    Please select how much { $tokenSymbol } you want to sell.

    Go to /settings to adjust slippage and gas if the transaction fails.

sell_token_msg = Enter token contract address of a token you want to sell:

# orders
orders_overview_msg =
    📋 *Orders Overview*

    🔹 *Total DCA Orders:* { $totalDcaOrders }
    🔹 *Total Limit Orders:* { $totalLimitOrders }

    To get more details about your limit & DCA orders, click the buttons below:

# Order message
limit_orders_header_msg =
    📋 *Limit Orders*
    
    🟢 → Active/Pending

    ✅ → Filled/Completed  
    
    ❌ → Cancelled
    
    ⏰ → Expired
    
    🔴 → Failed
    
    🔵 → Unknown

    ─────────────────

limit_order_item_msg =
    { $statusEmoji } *#{ $orderNumber } | { $makerSymbol } → { $takerSymbol }*
    • *Amount:* { $makerAmount } { $makerSymbol }
    • *Target:* { $takerAmount } { $takerSymbol }
    • *Range:* { $createdDate } → { $expiryDate }
    • *Hash:* `{ $orderHash }`

dca_orders_header_msg = 📋 *DCA Orders*

    🟢 → Active/Pending

    ✅ → Filled/Completed  
    
    ❌ → Cancelled
    
    ⏰ → Expired
    
    🔴 → Failed
    
    🔵 → Unknown

    ─────────────────

dca_order_item_msg =
    { $statusEmoji } *#{ $orderNumber } | { $makerSymbol } → { $takerSymbol }*
    • *Amount:* { $makerAmount } { $makerSymbol }
    • *Interval:* { $intervalText }
    • *Progress:* { $progress }/{ $totalTimes } executions
    • *Range:* { $createdDate } → { $expiryDate }
    • *Hash:* `{ $orderHash }`

orders_total_count_msg = Total Orders: { $totalCount }

no_dca_orders_msg =
    📋 *DCA Orders*

    You don't have any DCA orders yet.

    Use /dca to create your first DCA order.

no_limit_orders_msg =
    📋 *Limit Orders*

    You don't have any limit orders yet.

    Use /limit to create your first limit order.


# Limit Order Messages
limit_token_msg = Please send the token contract address for which you want to create a limit order:
limit_custom_amount_msg = Please enter the amount of tokens you want to buy:
limit_invalid_price_msg = ❌ Invalid price. Please enter a valid number greater than 0.
limit_invalid_expiry_msg = ⚠️ Invalid expiry time. Please enter a valid expiry time (e.g. 2H, 3D, 1W).
limit_price_msg = Please enter the price per token (in ETH) for your limit order:
limit_expiry_msg = Please select the expiry time for your limit order:
limit_custom_expiry_msg = Please enter the expiry time (e.g. 2H, 3D, 1W):
limit_restart_msg = Please start over with the /limit command.
limit_cancel_msg = ⭕ Limit order has been successfully cancelled!
limit_order_not_found_msg = ❌ Order not found or already cancelled.

limit_no_orders_msg =
    📋 *No Limit Orders*

    You don't have any limit orders yet.

    Use /limit to create your first limit order.

limit_token_found_msg =
    ✅ *Token Found*

    Symbol: *{ $tokenSymbol }*
    Name: *{ $tokenName }*
    Price: *{ $tokenPrice }*
    Chain: { $tokenChain }

    Please select how many { $tokenSymbol } you want to buy in your limit order.

    Go to /settings to adjust slippage and gas if the transaction fails.

limit_order_created_msg =
    🎊 Congratulations! Your limit order has been created successfully!

    Token: { $tokenSymbol }
    Amount: { $amount } { $tokenSymbol }
    Price: { $price } ETH per token
    Expiry: { $expiry }

    Your limit order has been submitted to the network. It will be executed when the market price reaches your target price.

    Use /orders to view all your orders.
    
limit_order_cancel_success_msg =
    ✅ *Limit Order Cancelled*

    Your limit order for { $makerSymbol } → { $takerSymbol } has been successfully cancelled.

    Use /orders to view your remaining orders.

limit_confirm_msg =
    🔍 *Confirm Limit Order*

    Token: { $tokenSymbol } | { $tokenName }
    CA: `{ $token }`
    Amount: { $amount } { $tokenSymbol }
    Price: { $price } ETH per token
    Total Value: { $totalValue } ETH
    Expiry: { $expiry }

    Please confirm the creation of your limit order:

# settings
gas_priority_updated_msg = Gas priority set to { $gasPriority }
slippage_updated_msg = Slippage set to { $slippage }
language_updated_msg = Language set to { $language }
set_gas_msg =
    ⛽ Set Gas Priority

    Select your preferred gas priority:

set_language_msg =
    🌎 Select Language

    Choose your preferred language:

set_slippage_msg =
    📊 Set Slippage Tolerance

    Select your preferred slippage tolerance:

settings_msg =
    ⚙️ *Settings*

    Current Settings:
    • Slippage: { $slippage }
    • Language: { $language }
    • Gas Priority: { $gasPriority }

    Best Practices:
    - Increase *slippage* to 1% for less liquid tokens
    - Set *gas priority* to high for fast transactions

    Please set your desired settings below.

# help & referrals
help_msg =
    🆘 *Help & Support*

    Quick Start:
    • /start - Start the bot
    • /wallet - Manage your wallet
    • /buy - Buy crypto tokens
    • /sell - Sell crypto tokens
    • /settings - Configure bot settings

    💡 *How do I use Neurodex?*
    Check out our [documentation](https://docs.neurodex.xyz) where we explain everything in detail. Join our support chat for additional resources.

    💰 *Where can I find my referral code?*
    Open the /referrals menu to view your unique referral code. Share it with friends to earn rewards!

    💰 *What are the fees?*
    • Trading fee: 1% per successful transaction
    • No subscription fees
    • No hidden charges
    • All features are free to use

    🔒 Security Tips:
    • NEVER share your private keys or seed phrases
    • Admins will NEVER DM you first
    • Use only official links from our website
    • We never store your private keys or seed phrases. When generating a new wallet - store your private key somewhere safe.

    💡 Trading Tips:
    Common issues and solutions:
    • Slippage Exceeded: Increase slippage or trade in smaller amounts
    • Insufficient balance: Add more funds or reduce transaction amount
    • Transaction timeout: Increase gas tip during high network load

    Need more help?
    Contact our support team by clicking the button below.

referral_msg =
    💎 *Referral Program*

    How it works:
    1. Share your referral link below with your friends & family
    2. When they sign up using your link, you earn 10% of their trading fees
    3. You can earn unlimited rewards!

    Your Referral Link:
    `{ $referral_link }`

    Learn more about rewards and tiers in our official [documentation](https://docs.neurodex.xyz/referral-program)

referral_stats_msg =
    📊 *Referral Statistics*

    Referred Users: { $totalReferrals } users
    Referral Trades: { $totalTrades } trades
    Referral Volume: { $totalVolume }
    Total Referral Earnings: { $totalEarned }

    Keep spreading the word and watch your earnings grow! 🚀

referral_success_notification_msg = 🥳 *Congratulations!* You just referred a new user to Neurodex! You're growing with us (and so are your rewards)!