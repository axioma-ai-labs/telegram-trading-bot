start_msg =
    💸 *Neurodex*

    Neurodex ist Ihr blitzschneller Krypto-Trading-Bot

    Kaufen und verkaufen Sie Kryptowährungen ganz einfach mit Neurodex.

    /buy - Kaufen Sie jeden Krypto-Token auf Base, BSC & Ethereum
    /sell - Verkaufen Sie jeden Krypto-Token auf Base, BSC & Ethereum
    /dca - Dollar Cost Averaging (DCA)
    /limit - Limit-Orders erstellen
    /wallet - Verwalten Sie Ihre Wallet
    /settings - Bot-Einstellungen konfigurieren
    /help - Hilfe und Support erhalten

    Powered by [Neurobro](https://neurobro.ai) und [Docs](https://docs.neurodex.xyz)

accept_terms_conditions_msg =
    💸 *Willkommen bei Neurodex*

    Bevor wir beginnen, lesen Sie bitte unsere Nutzungsbedingungen und Datenschutzrichtlinien und akzeptieren Sie diese.

    • [Nutzungsbedingungen](https://docs.neurodex.xyz/terms-of-service)
    • [Datenschutzrichtlinie](https://docs.neurodex.xyz/privacy-policy)

wallet_success_msg =
    ✅ *Ihre Wallet wurde erfolgreich erstellt*

    Wallet-Adresse: { $walletAddress }
    Private Key: { $privateKey }

    ⚠️ *WICHTIG:* Bewahren Sie Ihren Private Key sicher auf
    • Teilen Sie ihn mit niemandem
    • Speichern Sie ihn nicht digital oder online
    • Schreiben Sie ihn auf und bewahren Sie ihn sicher auf

    ⏰ Diese Nachricht wird in 5 Minuten aus Sicherheitsgründen gelöscht

    Um mit dem Trading zu beginnen, verwenden Sie den /start Befehl.

wallet_fail_msg =
    ❌ *Wallet-Erstellung fehlgeschlagen*

    Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder gehen Sie zu /help.

wallet_msg =
    💰 *Wallet:* { $walletAddress }

    Guthaben: { $ethBalance } ETH

    Um Geld einzuzahlen, senden Sie bitte Ihre Coins an die obige Wallet-Adresse.

wallet_repeat_pk_error_msg = ❌ *Private Key Verifizierung fehlgeschlagen*
    
    Die letzten 4 Zeichen, die Sie eingegeben haben, stimmen nicht mit Ihrem Private Key überein. Bitte versuchen Sie es unten erneut:

wallet_repeat_pk_msg = ⚠️ *Private Key verifizieren* 

    Bitte geben Sie die letzten 4 Zeichen Ihres Private Keys unten ein, um zu bestätigen, dass Sie ihn sich gemerkt und sicher gespeichert haben:

wallet_repeat_pk_success_msg = ✅ *Private Key verifiziert*

    Ihr Private Key wurde erfolgreich verifiziert.

    Um mit dem Trading zu beginnen, verwenden Sie den /start Befehl oder klicken Sie auf die Schaltfläche unten:

wallet_create_msg =
    💸 *Neurodex*

    Neurodex ist Ihr blitzschneller Krypto-Trading-Bot

    Um /buy, /sell oder andere Aktionen durchführen zu können, müssen Sie zuerst eine Wallet erstellen. Erstellen Sie jetzt eine, indem Sie auf die Schaltfläche unten klicken.

    Für Hilfe bei der Einrichtung lesen Sie bitte [diese Anleitung](https://docs.neurodex.xyz/getting-started/setup) oder holen Sie sich /help.

buy_token_msg = Geben Sie die Token-Vertragsadresse zum Kaufen ein:
dca_token_msg = Geben Sie die Token-Vertragsadresse für DCA ein:
error_msg = ❌ Transaktion fehlgeschlagen. Bitte versuchen Sie es später erneut.
invalid_amount_msg = ⚠️ Ungültiger Betrag ausgewählt. Bitte wählen Sie einen anderen Betrag.
invalid_price_msg = ⚠️ Ungültiger Preis ausgewählt. Bitte wählen Sie einen anderen Preis.

insufficient_funds_msg =
    ⚠️ Unzureichende Mittel zur Durchführung der Transaktion.

    Bitte stellen Sie sicher, dass Sie genug ETH haben für:
    • Den Transaktionsbetrag
    • Gas-Gebühren

invalid_token_msg = ❌ Kein Token ausgewählt. Bitte wählen Sie zuerst einen Token aus.
no_private_key_msg = ⚠️ Private Key nicht gefunden. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.
already_up_to_date_msg = ✨ Bereits auf dem neuesten Stand!
rate_limit_second_msg = Bitte langsamer! Maximal 3 Anfragen pro Sekunde.
rate_limit_minute_msg = Sie haben das Limit von 50 Anfragen pro Minute überschritten. Bitte warten Sie.
rate_limit_15min_msg = Sie haben das Limit von 300 Anfragen pro 15 Minuten überschritten. Bitte warten Sie.
token_not_found_msg = ❌ Token nicht gefunden. Bitte überprüfen Sie die Token-Vertragsadresse und versuchen Sie es erneut.

dca_times_msg = Bitte wählen Sie die Anzahl der Wiederholungen für Ihre DCA-Order:
dca_interval_msg = Bitte wählen Sie das Zeitintervall für Ihre DCA-Order:
dca_custom_amount_msg = Bitte geben Sie den ETH-Betrag ein, den Sie für Ihre DCA-Order ausgeben möchten:
dca_custom_interval_msg = Bitte geben Sie das Intervall in Stunden für Ihre DCA-Order ein:
dca_custom_times_msg = Bitte geben Sie die Anzahl der Wiederholungen (1-100) für Ihre DCA-Order ein:
dca_invalid_interval_msg = ⚠️ Ungültiges Intervall ausgewählt. Bitte wählen Sie ein anderes Intervall.
dca_invalid_times_msg = ⚠️ Ungültige Anzahl von Wiederholungen. Bitte geben Sie eine Zahl zwischen 1 und 100 ein.

dca_confirm_msg =
    🔍 *DCA-Order bestätigen*

    Token: { $tokenSymbol } | { $tokenName }
    CA: `{ $token }`
    Betrag: { $amount } ETH
    Intervall: { $interval }
    Wiederholungen: { $times }

    Bitte bestätigen Sie die Erstellung der DCA-Order:

dca_token_found_msg =
    ✅ *Token gefunden*

    Symbol: *{ $tokenSymbol }*
    Name: *{ $tokenName }*
    Preis: *{ $tokenPrice }*
    Chain: { $tokenChain }

    Bitte wählen Sie aus, wie viel ETH Sie für { $tokenSymbol } in Ihrer DCA-Order ausgeben möchten.

    Gehen Sie zu /settings, um Slippage und Gas anzupassen, falls die Transaktion fehlschlägt.

withdraw_msg =
    📤 *ETH oder andere Token abheben*

    Ihr Guthaben:
    - ETH: { $ethBalance }

    Wichtig:
    - Überprüfen Sie die Empfängeradresse doppelt
    - Abhebungen werden normalerweise innerhalb von Minuten bestätigt
    - Teilen Sie niemals Ihren Private Key mit jemandem

deposit_msg =
    📥 *ETH oder Token einzahlen*

    ETH: { $ethBalance }

    Senden Sie ETH oder jeden ERC-20 Token an Ihre Wallet: `{ $walletAddress }`

    Wichtig:
    - Senden Sie nur Assets im Base Network
    - ETH-Einzahlungen werden normalerweise innerhalb von Minuten bestätigt
    - Teilen Sie niemals Ihren Private Key mit jemandem

no_registration_msg =
    ❌ Sie sind nicht registriert.

    Bitte verwenden Sie /start, um zu beginnen.

no_wallet_msg =
    ❌ Sie haben keine Wallet.

    Bitte verwenden Sie /wallet, um eine zu erstellen.

sell_token_msg = Geben Sie die Token-Vertragsadresse eines Tokens ein, den Sie verkaufen möchten:

sell_token_found_msg =
    ✅ *Token gefunden*

    Symbol: *{ $tokenSymbol }*
    Name: *{ $tokenName }*
    Preis: *{ $tokenPrice }*
    Chain: { $tokenChain }

    Bitte wählen Sie aus, wie viel { $tokenSymbol } Sie verkaufen möchten.

    Gehen Sie zu /settings, um Slippage und Gas anzupassen, falls die Transaktion fehlschlägt.

sell_confirm_msg =
    🔍 *Verkaufsorder bestätigen*

    Token: *{ $tokenSymbol }* | { $tokenName }
    CA: `{ $tokenAddress }`
    Betrag: *{ $amount } { $tokenSymbol }*

    Sind Sie sicher, dass Sie mit diesem Verkauf fortfahren möchten?

sell_custom_amount_msg = Bitte geben Sie die Anzahl der Token ein, die Sie verkaufen möchten:
sell_balance_fetch_error_msg = ❌ Wallet-Guthaben konnte nicht abgerufen werden. Bitte versuchen Sie es erneut.
sell_no_balance_msg = ❌ Sie haben kein Guthaben dieses Tokens zum Verkaufen.
sell_insufficient_balance_msg = ❌ Unzureichendes Guthaben. Sie haben nur { $balance } { $tokenSymbol }.
sell_invalid_operation_msg = ❌ Ungültiger Verkaufsvorgang. Bitte versuchen Sie es erneut.
sell_private_key_error_msg = ❌ Private Key nicht gefunden. Bitte versuchen Sie es erneut.
sell_order_cancelled_msg = ✅ Verkaufsorder wurde erfolgreich storniert!
sell_success_msg =
    ✅ Verkaufsorder für { $amount } { $tokenSymbol } war erfolgreich!

    Transaktionsdetails:
    • Betrag: { $amount } { $tokenSymbol }
    • Token: { $token }
    • Transaktion: https://basescan.org/tx/{ $txHash }

help_msg =
    Hilfe & Support

    Schnellstart:
    • /start - Bot starten
    • /wallet - Wallet verwalten
    • /buy - Krypto-Token kaufen
    • /sell - Krypto-Token verkaufen
    • /settings - Bot-Einstellungen konfigurieren

    Wie verwende ich Neurodex?
    Schauen Sie sich unsere [Dokumentation](https://docs.neurodex.xyz) an, wo wir alles im Detail erklären. Treten Sie unserem Support-Chat für zusätzliche Ressourcen bei.

    💰 Wo finde ich meinen Empfehlungscode?
    Öffnen Sie das /referrals Menü, um Ihren einzigartigen Empfehlungscode anzuzeigen. Teilen Sie ihn mit Freunden, um Belohnungen zu verdienen!

    Was sind die Gebühren?
    • Trading-Gebühr: 1% pro erfolgreicher Transaktion
    • Keine Abonnementgebühren
    • Keine versteckten Kosten
    • Alle Funktionen sind kostenlos nutzbar

    🔒 Sicherheitstipps:
    • Teilen Sie NIEMALS Ihre Private Keys oder Seed Phrases
    • Admins werden Sie NIEMALS zuerst anschreiben
    • Verwenden Sie nur offizielle Links von unserer Website
    • Wir speichern niemals Ihre Private Keys oder Seed Phrases. Beim Erstellen einer neuen Wallet - bewahren Sie Ihren Private Key an einem sicheren Ort auf.

    💡 Trading-Tipps:
    Häufige Probleme und Lösungen:
    • Slippage überschritten: Erhöhen Sie die Slippage oder handeln Sie in kleineren Beträgen
    • Unzureichendes Guthaben: Fügen Sie mehr Geld hinzu oder reduzieren Sie den Transaktionsbetrag
    • Transaktion-Timeout: Erhöhen Sie das Gas-Tip bei hoher Netzwerklast

    Benötigen Sie weitere Hilfe?
    Kontaktieren Sie unser Support-Team, indem Sie auf die Schaltfläche unten klicken.

referral_msg =
    💎 *Empfehlungsprogramm*

    So funktioniert es:
    1. Teilen Sie Ihren Empfehlungslink unten mit Ihren Freunden und Ihrer Familie
    2. Wenn sie sich über Ihren Link anmelden, verdienen Sie 10% ihrer Trading-Gebühren
    3. Sie können unbegrenzte Belohnungen verdienen!

    Ihr Empfehlungslink:
    `{ $referral_link }`

    Erfahren Sie mehr über Belohnungen und Stufen in unserer offiziellen [Dokumentation](https://docs.neurodex.xyz/referral-program)

referral_stats_msg =
    📊 *Empfehlungsstatistiken*

    Empfohlene Benutzer: { $totalReferrals } Benutzer
    Empfohlene Trades: { $totalTrades } Trades
    Empfohlenes Volumen: { $totalVolume }
    Gesamte Empfehlungseinnahmen: { $totalEarned }

    Verbreiten Sie weiter das Wort und sehen Sie zu, wie Ihre Einnahmen wachsen! 🚀

referral_success_notification_msg = 🥳 *Boom!* Sie haben gerade einen neuen Benutzer zu Neurodex empfohlen! Sie wachsen mit uns (und mit Ihren Belohnungen)!

settings_msg =
    ⚙️ *Einstellungen*

    Aktuelle Einstellungen:
    • Slippage: { $slippage }
    • Sprache: { $language }
    • Gas-Priorität: { $gasPriority }

    Best Practices:
    - Erhöhen Sie die *Slippage* auf 1% für weniger liquide Token
    - Setzen Sie die *Gas-Priorität* auf hoch für schnelle Transaktionen

    Bitte stellen Sie Ihre gewünschten Einstellungen unten ein.

set_slippage_msg =
    📊 Slippage-Toleranz einstellen

    Wählen Sie Ihre bevorzugte Slippage-Toleranz:

set_language_msg =
    🌎 Sprache auswählen

    Wählen Sie Ihre bevorzugte Sprache:

set_gas_msg =
    ⛽ Gas-Priorität einstellen

    Wählen Sie Ihre bevorzugte Gas-Priorität:

slippage_updated_msg = Slippage auf { $slippage } gesetzt
language_updated_msg = Sprache auf { $language } gesetzt
gas_priority_updated_msg = Gas-Priorität auf { $gasPriority } gesetzt

dca_order_cancelled_msg = ✅ DCA-Order wurde erfolgreich storniert!
dca_no_active_orders_msg = ❌ Keine aktiven DCA-Orders zum Stornieren gefunden.
dca_orders_found_msg = ✅ DCA-Orders gefunden.
dca_no_orders_msg = ❌ Keine aktiven DCA-Orders gefunden.
dca_cancel_failed_msg = ❌ DCA-Order konnte nicht storniert werden. Bitte versuchen Sie es später erneut.

dca_order_created_msg =
    🎊 *Herzlichen Glückwunsch! Ihre DCA-Order wurde erfolgreich erstellt!*

    Token: { $tokenSymbol } | { $tokenName }
    CA: `{ $token }`
    Betrag: { $amount } ETH
    Intervall: { $interval }
    Wiederholungen: { $times }

    Sie können Ihre offenen DCA-Orders mit /orders einsehen!

# Limit Order Messages
limit_token_msg = Bitte senden Sie die Vertragsadresse des Tokens, für den Sie eine Limit-Order erstellen möchten:
limit_custom_amount_msg = Bitte geben Sie die Anzahl der Token ein, die Sie kaufen möchten:
limit_error_msg = ❌ Limit-Order konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.
limit_invalid_price_msg = ❌ Ungültiger Preis. Bitte geben Sie eine gültige Zahl größer als 0 ein.
limit_invalid_expiry_msg = ⚠️ Ungültige Ablaufzeit. Bitte geben Sie eine gültige Ablaufzeit ein (z.B. 2H, 3D, 1W).
limit_price_msg = Bitte geben Sie den Preis pro Token (in ETH) für Ihre Limit-Order ein:
limit_expiry_msg = Bitte wählen Sie die Ablaufzeit für Ihre Limit-Order:
limit_custom_expiry_msg = Bitte geben Sie die Ablaufzeit ein (z.B. 2H, 3D, 1W):
limit_restart_msg = Bitte beginnen Sie erneut mit dem /limit Befehl.
limit_no_order_msg = Keine Limit-Order zum Bestätigen.
limit_private_key_error_msg = ❌ Private Key konnte nicht abgerufen werden.
limit_token_info_error_msg = ❌ Token-Informationen konnten nicht abgerufen werden.
limit_order_cancelled_msg = ❌ Limit-Order-Erstellung abgebrochen.
limit_no_wallet_msg = ❌ Keine Wallet gefunden. Bitte erstellen Sie zuerst eine Wallet.
limit_order_details_error_msg = ❌ Order-Details konnten nicht abgerufen werden.
limit_order_not_found_msg = ❌ Order nicht gefunden oder bereits storniert.
limit_loading_orders_msg = 📋 Lade Ihre Limit-Orders...
limit_create_error_msg = ❌ Limit-Order konnte nicht erstellt werden: { $error }
limit_retrieve_error_msg = ❌ Limit-Orders konnten nicht abgerufen werden: { $error }
limit_cancel_error_msg = ❌ Limit-Order konnte nicht storniert werden: { $error }

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

    Bitte wählen Sie aus, wie viel { $tokenSymbol } Sie in Ihrer Limit-Order kaufen möchten.

    Gehen Sie zu /settings, um Slippage und Gas anzupassen, falls die Transaktion fehlschlägt.

limit_order_created_msg =
    ✅ *Limit-Order erfolgreich erstellt!*

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

    Bitte bestätigen Sie die Erstellung der Limit-Order:

# buy
buy_amount_msg = Bitte geben Sie den ETH-Betrag ein, den Sie ausgeben möchten:

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
