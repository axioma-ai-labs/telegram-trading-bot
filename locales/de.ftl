# start
start_msg =
    💸 *Neurodex*

    Neurodex ist Ihr blitzschneller Krypto-Trading-Bot.

    Kaufen und verkaufen Sie Kryptowährungen, erstellen Sie DCA-Orders, richten Sie Limit-Orders ganz einfach mit Neurodex ein.

    Neurodex unterstützt derzeit den Handel auf *Base*, *BSC* und *Ethereum*.

    /buy - Krypto-Token kaufen
    /sell - Krypto-Token verkaufen
    /dca - DCA-Order erstellen
    /limit - Limit-Order erstellen
    /orders - Ihre Limit- und DCA-Orders anzeigen
    /wallet - Ihre Wallet verwalten
    /settings - Bot-Einstellungen personalisieren
    /help - Hilfe und Support erhalten

    ⚡ Powered by [Neurobro](https://neurobro.ai) und [Docs](https://docs.neurodex.xyz)

# terms & conditions
accept_terms_conditions_msg =
    💸 *Willkommen bei Neurodex*

    Bevor wir beginnen, lesen Sie bitte unsere Nutzungsbedingungen und Datenschutzrichtlinien und akzeptieren Sie diese.

    • [Nutzungsbedingungen](https://docs.neurodex.xyz/terms-of-service)
    • [Datenschutzrichtlinie](https://docs.neurodex.xyz/privacy-policy)


# wallet
wallet_create_msg =
    💸 *Neurodex*

    Neurodex ist Ihr blitzschneller Krypto-Trading-Bot

    Um /buy, /sell oder andere Aktionen durchführen zu können, müssen Sie zuerst eine Wallet erstellen. Erstellen Sie jetzt eine, indem Sie auf die Schaltfläche unten klicken.

    Für Hilfe bei der Einrichtung lesen Sie bitte [diese Anleitung](https://docs.neurodex.xyz/getting-started/setup) oder holen Sie sich /help.



wallet_fail_msg =
    ❌ *Wallet-Erstellung fehlgeschlagen*

    Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder gehen Sie zu /help.

wallet_msg =
    💰 *Portfolio-Übersicht* 

    📊 *Gesamtwert:* ${ $totalPortfolioValue }

    • *ETH-Guthaben:* { $ethBalance } ETH

    • *Token-Bestände:*
    { $formattedBalances }

    Entdecken Sie tiefere Einblicke und Markt-Alpha bei [Neurobro](https://neurobro.ai)

wallet_repeat_pk_error_msg = ❌ *Private Key Verifizierung fehlgeschlagen*
    
    Die letzten 4 Zeichen, die Sie eingegeben haben, stimmen nicht mit Ihrem Private Key überein. Bitte versuchen Sie es unten erneut:

wallet_repeat_pk_msg = ⚠️ *Private Key verifizieren* 

    Bitte geben Sie die letzten 4 Zeichen Ihres Private Keys unten ein, um zu bestätigen, dass Sie ihn sich gemerkt und sicher gespeichert haben:

wallet_repeat_pk_success_msg = ✅ *Private Key verifiziert*

    Ihr Private Key wurde erfolgreich verifiziert.

    Um mit dem Trading zu beginnen, verwenden Sie den /start Befehl oder klicken Sie auf die Schaltfläche unten:


wallet_success_msg =
    ✅ *Ihre Wallet wurde erfolgreich erstellt*

    • *Wallet-Adresse:* `{ $walletAddress }`

    • *Private Key:* `{ $privateKey }`

    ⚠️ *WICHTIG:* Bewahren Sie Ihren Private Key sicher auf
    • Teilen Sie ihn mit niemandem
    • Speichern Sie ihn nicht digital oder online
    • Schreiben Sie ihn auf und bewahren Sie ihn sicher auf

    ⏰ Diese Nachricht wird in 5 Minuten aus Sicherheitsgründen gelöscht

    Um mit dem Trading zu beginnen, verwenden Sie den /start Befehl.


# error & status messages
error_msg = ❌ Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.
insufficient_funds_msg =
    ⚠️ Unzureichende Mittel zur Durchführung der Transaktion.

    Bitte stellen Sie sicher, dass Sie genug ETH haben für:
    • Den Transaktionsbetrag
    • Gas-Gebühren
invalid_amount_msg = ⚠️ Ungültiger Betrag ausgewählt. Bitte wählen Sie einen anderen Betrag.
invalid_token_msg = ⚠️ Kein Token ausgewählt. Bitte wählen Sie zuerst einen Token aus.
invalid_price_msg = ⚠️ Ungültiger Preis ausgewählt. Bitte wählen Sie einen anderen Preis
no_wallet_msg = ⚠️ Sie haben keine Wallet. Bitte erstellen Sie eine mit /wallet oder klicken Sie auf die Schaltfläche unten:
no_private_key_msg = ⚠️ Private Key nicht gefunden. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.
already_up_to_date_msg = ✨ Bereits auf dem neuesten Stand!
rate_limit_second_msg = Bitte langsamer! Maximal 3 Anfragen pro Sekunde.
rate_limit_minute_msg = Sie haben das Limit von 50 Anfragen pro Minute überschritten. Bitte warten Sie.
rate_limit_15min_msg = Sie haben das Limit von 300 Anfragen pro 15 Minuten überschritten. Bitte warten Sie.
token_not_found_msg = ❌ Token nicht gefunden. Bitte überprüfen Sie die Token-Vertragsadresse und versuchen Sie es erneut.

# dca
dca_cancel_msg = ⭕ DCA-Order wurde erfolgreich storniert!
dca_confirm_msg =
    🔍 *DCA-Order bestätigen*

    Token: { $tokenSymbol } | { $tokenName }
    CA: `{ $token }`
    Betrag: { $amount } ETH
    Intervall: { $interval }
    Wiederholungen: { $times }

    Bitte bestätigen Sie die Erstellung der DCA-Order:

dca_custom_amount_msg = Bitte geben Sie den ETH-Betrag ein, den Sie für Ihre DCA-Order ausgeben möchten:
dca_custom_interval_msg = Bitte geben Sie das Intervall in Stunden für Ihre DCA-Order ein:
dca_custom_times_msg = Bitte geben Sie die Anzahl der Wiederholungen (1-100) für Ihre DCA-Order ein:
dca_interval_msg = Bitte wählen Sie das Zeitintervall für Ihre DCA-Order:
dca_invalid_interval_msg = ⚠️ Ungültiges Intervall ausgewählt. Bitte wählen Sie ein anderes Intervall.
dca_invalid_times_msg = ⚠️ Ungültige Anzahl von Wiederholungen. Bitte geben Sie eine Zahl zwischen 1 und 100 ein.
dca_no_orders_msg = Keine aktiven DCA-Orders gefunden.

dca_orders_found_msg = ✅ DCA-Orders gefunden.
dca_success_msg =
    🎊 *Herzlichen Glückwunsch! Ihre DCA-Order wurde erfolgreich erstellt!*

    Token: { $tokenSymbol } | { $tokenName }
    CA: `{ $token }`
    Betrag: { $amount } ETH
    Intervall: { $interval }
    Wiederholungen: { $times }

    Sie können Ihre offenen DCA-Orders mit /orders anzeigen!

dca_times_msg = Bitte wählen Sie die Anzahl der Wiederholungen für Ihre DCA-Order:
dca_token_found_msg =
    ✅ *Token gefunden*

    Symbol: *{ $tokenSymbol }*
    Name: *{ $tokenName }*
    Preis: *{ $tokenPrice }*
    Chain: { $tokenChain }

    Bitte wählen Sie aus, wie viel ETH Sie für { $tokenSymbol } in Ihrer DCA-Order ausgeben möchten.

    Gehen Sie zu /settings, um Slippage und Gas anzupassen, falls die Transaktion fehlschlägt.

dca_token_msg = Geben Sie die Token-Vertragsadresse für DCA ein:

# deposit & withdraw
deposit_msg =
    📥 *ETH oder Token einzahlen*

    💰 *Wallet:* `{ $walletAddress }`

    📊 *Gesamter Portfolio-Wert:* ${ $totalPortfolioValue }

    🔹 *ETH-Guthaben:* { $ethBalance } ETH

    🔹 *Token-Guthaben:*
    { $formattedBalances }

    Wichtig:
    - Senden Sie nur Assets im Base Network
    - ETH-Einzahlungen werden normalerweise innerhalb von Minuten bestätigt
    - Teilen Sie niemals Ihren Private Key mit jemandem

withdraw_msg =
    📤 *ETH oder andere Token abheben*

    Ihr Guthaben:
    - ETH: { $ethBalance }

    Wichtig:
    - Überprüfen Sie die Empfängeradresse doppelt
    - Abhebungen werden normalerweise innerhalb von Minuten bestätigt
    - Teilen Sie niemals Ihren Private Key mit jemandem

withdraw_select_amount_msg =
    📤 *ETH abheben*

    Ihr Guthaben: { $ethBalance } ETH

    Bitte wählen Sie aus, wie viel ETH Sie abheben möchten:

    Wichtig:
    - Überprüfen Sie die Empfängeradresse doppelt
    - Abhebungen werden normalerweise innerhalb von Minuten bestätigt
    - Teilen Sie niemals Ihren Private Key mit jemandem

withdraw_custom_amount_msg = Bitte geben Sie den ETH-Betrag ein, den Sie abheben möchten:
withdraw_recipient_address_msg = Bitte geben Sie die Empfänger-Wallet-Adresse ein (0x...):
withdraw_insufficient_balance_msg = ⚠️ Unzureichendes Guthaben. Sie haben nur { $balance } ETH, möchten aber { $amount } ETH abheben.
withdraw_invalid_operation_msg = ⚠️ Ungültiger Abhebungsvorgang. Bitte versuchen Sie es erneut.
withdraw_error_msg = ❌ Etwas ist während der Abhebung schiefgelaufen. Bitte versuchen Sie es erneut.
withdraw_cancel_msg = ⭕ Die Abhebung wurde storniert.
invalid_address_msg = ⚠️ Ungültiges Adressformat. Bitte geben Sie eine gültige Ethereum-Adresse ein, die mit 0x beginnt.
invalid_input_msg = ⚠️ Ungültige Eingabe. Bitte versuchen Sie es erneut.

withdraw_confirm_msg =
    🔍 *Abhebung bestätigen*

    Betrag: *{ $amount } ETH*
    An Adresse: `{ $recipientAddress }`

    Sind Sie sicher, dass Sie mit dieser Abhebung fortfahren möchten?

withdraw_success_msg =
    🎊 *Abhebung erfolgreich!*

    • *Betrag:* { $amount } ETH
    • *Von:* { $walletAddress }
    • *An Adresse:* `{ $recipientAddress }`

    Ihre Abhebung wurde an das Netzwerk übermittelt und sollte innerhalb von Minuten bestätigt werden.

    Überprüfen Sie Ihre Transaktion auf [BaseScan](https://basescan.org/tx/{ $txHash })

# sell
sell_cancel_msg = ⭕ Verkaufsorder wurde erfolgreich storniert!

sell_confirm_msg =
    🎯 *Verkaufsorder bestätigen*

    📊 **Details:**
    • *Symbol:* **${ $tokenSymbol }** | { $tokenName }
    • *Vertrag:* `{ $tokenAddress }`

    💰 **Transaktionsübersicht:**
    • *Verkauf:* **{ $amount } { $tokenSymbol }** (≈ { $usdValue })

    Wichtig: Diese Aktion kann nicht rückgängig gemacht werden. Bitte überprüfen Sie sorgfältig.

    Möchten Sie mit diesem Verkauf fortfahren?

sell_custom_amount_msg = Bitte geben Sie die Anzahl der Token ein, die Sie verkaufen möchten:
sell_error_msg = ❌ Etwas ist beim Verkaufsvorgang schiefgelaufen. Bitte versuchen Sie es erneut.
sell_insufficient_balance_msg = ⚠️ Unzureichendes Guthaben. Sie haben nur { $balance } { $tokenSymbol }.
sell_invalid_operation_msg = ⚠️ Ungültiger Verkaufsvorgang. Bitte versuchen Sie es erneut.
sell_no_balance_msg = ⚠️ Sie haben kein Guthaben dieses Tokens zum Verkaufen.
sell_success_msg =
    🎊 *Verkaufsorder erfolgreich!*

    Transaktionsdetails:
    • Token: *{ $tokenSymbol }*
    • Verkauft: *{ $amount } { $tokenSymbol }*
    • Vertrag: `{ $token }`
    
    Ansehen auf [BaseScan](https://basescan.org/tx/{ $txHash })

    Benötigen Sie Hilfe? Verwenden Sie /help, um häufige Probleme und Lösungen zu sehen.

sell_token_found_msg = 
    ✅ *${ $tokenSymbol }* | *{ $tokenName }* auf *{ $tokenChain }*

    Guthaben: *{ $balance } { $tokenSymbol }*

    Preis: *${ $tokenPrice }*

    Wählen Sie aus, wie viel *${ $tokenSymbol }* Sie verkaufen möchten.

    Gehen Sie zu /settings, um Slippage und Gas anzupassen, falls die Transaktion fehlschlägt.

sell_token_msg = 
    💵 *Token verkaufen*

    🔹 *ETH-Guthaben:* { $ethBalance } ETH

    🔹 *Token-Guthaben:*
    { $formattedSellBalances }

    Geben Sie die Vertragsadresse eines Tokens ein, den Sie verkaufen möchten:

# transactions
transactions_overview_msg =
    💳 *Transaktionshistorie*
    📊 *Gesamte Transaktionen:* { $totalTransactions }
    ✅ *Erfolgreich:* { $successfulTrades }
    ❌ *Fehlgeschlagen:* { $failedTrades }
    🟡 *Ausstehend:* { $pendingTrades }
    💰 *Gesamtvolumen:* { $totalVolume } ETH
    Wählen Sie aus, was Sie anzeigen möchten:
recent_transactions_header_msg = 📋 *Letzte Transaktionen (Letzte 10)*
all_transactions_header_msg = 
    📋 *Alle Transaktionen*
    
    Seite { $page } von { $totalPages } (Gesamt: { $total })
select_transaction_type_msg = 
    📊 *Transaktionstyp auswählen*
    
    Wählen Sie, welche Art von Transaktionen Sie anzeigen möchten:
transactions_of_type_header_msg =
    📋 *{ $type } Transaktionen*
    
    Seite { $page } von { $totalPages } (Gesamt: { $total })
no_transactions_msg = 
    📋 *Keine Transaktionen*
    
    Sie haben noch keine Transaktionen durchgeführt.
    
    Beginnen Sie den Handel mit /buy, /sell, /dca oder /limit!
no_transactions_of_type_msg = 
    📋 *Keine { $type } Transaktionen*
    
    Sie haben noch keine { $type } Transaktionen durchgeführt.
transaction_stats_header_msg = 📊 *Transaktionsstatistiken*
transaction_stats_overview_msg = 
    📈 *Übersicht:*
    • Gesamt: { $totalTransactions }
    • Erfolgreich: { $successfulTrades }
    • Fehlgeschlagen: { $failedTrades }
    • Ausstehend: { $pendingTrades }
    • Volumen: { $totalVolume } ETH
transaction_stats_by_type_msg = 📊 *Nach Typ:*
# transaction formatting
transaction_item_msg =
    { $statusEmoji }{ $typeEmoji } *#{ $transactionNumber } { $type }*
    { $details }
    🕒 { $createdDate } { $createdTime }
    🔗 { $txHash } | ⛓️ { $chain }
transaction_buy_details_msg = Ausgegeben { $tokenInAmount } { $tokenInSymbol } → { $tokenOutSymbol } ({ $tokenOutAmount })
transaction_sell_details_msg = Verkauft { $tokenInAmount } { $tokenInSymbol } → { $tokenOutSymbol } ({ $tokenOutAmount })
transaction_dca_details_msg = DCA { $tokenInAmount } { $tokenInSymbol } → { $tokenOutSymbol } | { $times } mal | { $expire }
transaction_limit_details_msg = Limit { $tokenInAmount } { $tokenInSymbol } → { $tokenOutSymbol } ({ $tokenOutAmount }) | { $expire }
transaction_withdraw_details_msg = Abgehoben { $tokenInAmount } { $tokenInSymbol } an { $toAddress }
transaction_unknown_details_msg = Unbekannter Transaktionstyp

# orders
orders_overview_msg =
    📋 *Orders-Übersicht*

    🔹 *Gesamt DCA-Orders:* { $totalDcaOrders }
    🔹 *Gesamt Limit-Orders:* { $totalLimitOrders }

    Um weitere Details zu Ihren Limit- und DCA-Orders zu erhalten, klicken Sie auf die Schaltflächen unten:

# Order message
limit_orders_header_msg =
    📋 *Limit-Orders*
    
    🟢 → Aktiv/Ausstehend

    ✅ → Ausgeführt/Abgeschlossen  
    
    ❌ → Storniert
    
    ⏰ → Abgelaufen
    
    🔴 → Fehlgeschlagen
    
    🔵 → Unbekannt

    ─────────────────

limit_order_item_msg =
    { $statusEmoji } *#{ $orderNumber } | { $makerSymbol } → { $takerSymbol }*
    • *Betrag:* { $makerAmount } { $makerSymbol }
    • *Ziel:* { $takerAmount } { $takerSymbol }
    • *Zeitraum:* { $createdDate } → { $expiryDate }
    • *Hash:* `{ $orderHash }`

dca_orders_header_msg = 📋 *DCA-Orders*

    🟢 → Aktiv/Ausstehend

    ✅ → Ausgeführt/Abgeschlossen  
    
    ❌ → Storniert
    
    ⏰ → Abgelaufen
    
    🔴 → Fehlgeschlagen
    
    🔵 → Unbekannt

    ─────────────────

dca_order_item_msg =
    { $statusEmoji } *#{ $orderNumber } | { $makerSymbol } → { $takerSymbol }*
    • *Betrag:* { $makerAmount } { $makerSymbol }
    • *Intervall:* { $intervalText }
    • *Fortschritt:* { $progress }/{ $totalTimes } Ausführungen
    • *Zeitraum:* { $createdDate } → { $expiryDate }
    • *Hash:* `{ $orderHash }`

orders_total_count_msg = Gesamt Orders: { $totalCount }

no_dca_orders_msg =
    📋 *DCA-Orders*

    Sie haben noch keine DCA-Orders.

    Verwenden Sie /dca, um Ihre erste DCA-Order zu erstellen.

no_limit_orders_msg =
    📋 *Limit-Orders*

    Sie haben noch keine Limit-Orders.

    Verwenden Sie /limit, um Ihre erste Limit-Order zu erstellen.


# Limit Order Messages
limit_token_msg = Bitte senden Sie die Token-Vertragsadresse, für die Sie eine Limit-Order erstellen möchten:
limit_custom_amount_msg = Bitte geben Sie die Anzahl der Token ein, die Sie kaufen möchten:
limit_invalid_price_msg = ❌ Ungültiger Preis. Bitte geben Sie eine gültige Zahl größer als 0 ein.
limit_invalid_expiry_msg = ⚠️ Ungültige Ablaufzeit. Bitte geben Sie eine gültige Ablaufzeit ein (z.B. 2H, 3D, 1W).
limit_price_msg = Bitte geben Sie den Preis pro Token (in ETH) für Ihre Limit-Order ein:
limit_expiry_msg = Bitte wählen Sie die Ablaufzeit für Ihre Limit-Order:
limit_custom_expiry_msg = Bitte geben Sie die Ablaufzeit ein (z.B. 2H, 3D, 1W):
limit_restart_msg = Bitte beginnen Sie von vorne mit dem /limit Befehl.
limit_cancel_msg = ⭕ Limit-Order wurde erfolgreich storniert!
limit_order_not_found_msg = ❌ Order nicht gefunden oder bereits storniert.

limit_no_orders_msg =
    📋 *Keine Limit-Orders*

    Sie haben noch keine Limit-Orders.

    Verwenden Sie /limit, um Ihre erste Limit-Order zu erstellen.

limit_token_found_msg =
    ✅ *Token gefunden*

    Symbol: *{ $tokenSymbol }*
    Name: *{ $tokenName }*
    Preis: *{ $tokenPrice }*
    Chain: { $tokenChain }

    Bitte wählen Sie aus, wie viele { $tokenSymbol } Sie in Ihrer Limit-Order kaufen möchten.

    Gehen Sie zu /settings, um Slippage und Gas anzupassen, falls die Transaktion fehlschlägt.

limit_order_created_msg =
    🎊 Herzlichen Glückwunsch! Ihre Limit-Order wurde erfolgreich erstellt!

    Token: { $tokenSymbol }
    Betrag: { $amount } { $tokenSymbol }
    Preis: { $price } ETH pro Token
    Ablauf: { $expiry }

    Ihre Limit-Order wurde an das Netzwerk übermittelt. Sie wird ausgeführt, wenn der Marktpreis Ihren Zielpreis erreicht.

    Verwenden Sie /orders, um alle Ihre Orders anzuzeigen.
    
limit_order_cancel_success_msg =
    ✅ *Limit-Order storniert*

    Ihre Limit-Order für { $makerSymbol } → { $takerSymbol } wurde erfolgreich storniert.

    Verwenden Sie /orders, um Ihre verbleibenden Orders anzuzeigen.

limit_confirm_msg =
    🔍 *Limit-Order bestätigen*

    Token: { $tokenSymbol } | { $tokenName }
    CA: `{ $token }`
    Betrag: { $amount } { $tokenSymbol }
    Preis: { $price } ETH pro Token
    Gesamtwert: { $totalValue } ETH
    Ablauf: { $expiry }

    Bitte bestätigen Sie die Erstellung Ihrer Limit-Order:

# buy
buy_amount_msg = Bitte geben Sie den ETH-Betrag ein, den Sie ausgeben möchten:
buy_cancel_msg = ⭕ Kauforder wurde erfolgreich storniert!

buy_confirm_msg =
    🔍 *Kauforder bestätigen*

    Token: *{ $tokenSymbol }* | { $tokenName }
    CA: `{ $token }`
    Betrag: *{ $amount } ETH*

    Sind Sie sicher, dass Sie mit diesem Kauf fortfahren möchten?

buy_error_msg = ❌ Etwas ist beim Kaufvorgang schiefgelaufen. Bitte versuchen Sie es erneut.
buy_success_msg =
    🎊 *Herzlichen Glückwunsch! Ihre Kauforder für { $amount } { $tokenSymbol } wurde erfolgreich erstellt!*

    Transaktionsdetails:
    • Betrag: { $amount } { $tokenSymbol }
    • Token: { $token }
    • Transaktion: https://basescan.org/tx/{ $txHash }

    Schauen Sie sich Ihre Transaktion auf [BaseScan](https://basescan.org/tx/{ $txHash }) an
buy_token_found_msg =
    ✅ *Token gefunden*

    Symbol: *${ $tokenSymbol }*
    Name: *{ $tokenName }*
    Preis: ${ $tokenPrice }
    Chain: { $tokenChain }

    Bitte wählen Sie aus, wie viel ETH Sie für { $tokenSymbol } ausgeben möchten.

    Gehen Sie zu /settings, um Slippage und Gas anzupassen, falls die Transaktion fehlschlägt.

buy_token_msg = Geben Sie die Token-Vertragsadresse zum Kaufen ein:


# settings
gas_priority_updated_msg = Gas-Priorität auf { $gasPriority } gesetzt
slippage_updated_msg = Slippage auf { $slippage } gesetzt
language_updated_msg = Sprache auf { $language } gesetzt
set_gas_msg =
    ⛽ Gas-Priorität festlegen

    Wählen Sie Ihre bevorzugte Gas-Priorität:

set_language_msg =
    🌎 Sprache auswählen

    Wählen Sie Ihre bevorzugte Sprache:

set_slippage_msg =
    📊 Slippage-Toleranz festlegen

    Wählen Sie Ihre bevorzugte Slippage-Toleranz:

settings_msg =
    ⚙️ *Einstellungen*

    Aktuelle Einstellungen:
    • Slippage: { $slippage }
    • Sprache: { $language }
    • Gas-Priorität: { $gasPriority }

    Best Practices:
    - Erhöhen Sie *Slippage* auf 1% für weniger liquide Token
    - Setzen Sie *Gas-Priorität* auf hoch für schnelle Transaktionen

    Bitte stellen Sie Ihre gewünschten Einstellungen unten ein.

# help & referrals
help_msg =
    🆘 *Hilfe & Support*

    Schnellstart:
    • /start - Bot starten
    • /wallet - Wallet verwalten
    • /buy - Krypto-Token kaufen
    • /sell - Krypto-Token verkaufen
    • /settings - Bot-Einstellungen konfigurieren

    💡 *Wie verwende ich Neurodex?*
    Schauen Sie sich unsere [Dokumentation](https://docs.neurodex.xyz) an, wo wir alles im Detail erklären. Treten Sie unserem Support-Chat für zusätzliche Ressourcen bei.

    💰 *Wo finde ich meinen Empfehlungscode?*
    Öffnen Sie das /referrals Menü, um Ihren einzigartigen Empfehlungscode anzuzeigen. Teilen Sie ihn mit Freunden, um Belohnungen zu verdienen!

    💰 *Was sind die Gebühren?*
    • Handelsgebühr: 1% pro erfolgreicher Transaktion
    • Keine Abonnementgebühren
    • Keine versteckten Kosten
    • Alle Funktionen sind kostenlos nutzbar

    🔒 Sicherheitstipps:
    • Teilen Sie NIEMALS Ihre Private Keys oder Seed-Phrasen
    • Admins werden Sie NIEMALS zuerst anschreiben
    • Verwenden Sie nur offizielle Links von unserer Website
    • Wir speichern niemals Ihre Private Keys oder Seed-Phrasen. Beim Erstellen einer neuen Wallet - bewahren Sie Ihren Private Key sicher auf.

    💡 Trading-Tipps:
    Häufige Probleme und Lösungen:
    • Slippage überschritten: Erhöhen Sie Slippage oder handeln Sie in kleineren Beträgen
    • Unzureichendes Guthaben: Fügen Sie mehr Geld hinzu oder reduzieren Sie den Transaktionsbetrag
    • Transaktions-Timeout: Erhöhen Sie Gas-Tip bei hoher Netzwerklast

    Benötigen Sie weitere Hilfe?
    Kontaktieren Sie unser Support-Team, indem Sie auf die Schaltfläche unten klicken.

referral_msg =
    💎 *Empfehlungsprogramm*

    So funktioniert es:
    1. Teilen Sie Ihren Empfehlungslink unten mit Ihren Freunden und Familie
    2. Wenn sie sich über Ihren Link anmelden, verdienen Sie 10% ihrer Handelsgebühren
    3. Sie können unbegrenzte Belohnungen verdienen!

    Ihr Empfehlungslink:
    `{ $referral_link }`

    Erfahren Sie mehr über Belohnungen und Stufen in unserer offiziellen [Dokumentation](https://docs.neurodex.xyz/referral-program)

referral_stats_msg =
    📊 *Empfehlungsstatistiken*

    Empfohlene Benutzer: { $totalReferrals } Benutzer
    Empfehlungshandel: { $totalTrades } Trades
    Empfehlungsvolumen: { $totalVolume }
    Gesamte Empfehlungseinnahmen: { $totalEarned }

    Verbreiten Sie weiter das Wort und sehen Sie zu, wie Ihre Einnahmen wachsen! 🚀

referral_success_notification_msg = 🥳 *Herzlichen Glückwunsch!* Sie haben gerade einen neuen Benutzer zu Neurodex empfohlen! Sie wachsen mit uns (und so auch Ihre Belohnungen)!