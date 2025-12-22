# start
start_msg =
    💸 *Neurodex*

    Neurodex es tu bot de trading de criptomonedas ultrarrápido.

    Compra y vende criptomonedas, crea órdenes DCA, configura órdenes límite fácilmente usando Neurodex.

    Neurodex actualmente soporta trading en *Base*, *BSC* y *Ethereum*.

    /buy - Comprar tokens cripto
    /sell - Vender tokens cripto
    /dca - Crear orden DCA
    /limit - Crear orden límite
    /orders - Ver tus órdenes límite y DCA
    /wallet - Gestionar tu billetera
    /settings - Personalizar configuraciones del bot
    /help - Obtener ayuda y soporte

    ⚡ Desarrollado por [Neurobro](https://neurobro.ai) y [Docs](https://docs.neurodex.xyz)

# terms & conditions
accept_terms_conditions_msg =
    💸 *Bienvenido a Neurodex*

    Antes de comenzar, por favor revisa y acepta nuestros términos de servicio y política de privacidad.

    • [Términos de Servicio](https://docs.neurodex.xyz/terms-of-service)
    • [Política de Privacidad](https://docs.neurodex.xyz/privacy-policy)


# wallet
wallet_create_msg =
    💸 *Neurodex*

    Neurodex es tu bot de trading de criptomonedas ultrarrápido

    Para poder /buy, /sell o realizar cualquier otra acción, primero debes crear una billetera. Crea una ahora haciendo clic en el botón de abajo.

    Para ayuda con la configuración, por favor consulta [esta guía](https://docs.neurodex.xyz/getting-started/setup) u obtén /help.



wallet_fail_msg =
    ❌ *Falló la Creación de Billetera*

    Algo salió mal. Por favor intenta de nuevo o ve a /help.

wallet_msg =
    💰 *Resumen del Portafolio* 

    📊 *Valor Total:* ${ $totalPortfolioValue }

    • *Balance ETH:* { $ethBalance } ETH

    • *Tenencias de Tokens:*
    { $formattedBalances }

    Descubre insights más profundos y alfa del mercado en [Neurobro](https://neurobro.ai)

wallet_repeat_pk_error_msg = ❌ *Verificación de Clave Privada Fallida*
    
    Los últimos 4 caracteres que ingresaste no coinciden con tu clave privada. Por favor intenta de nuevo abajo:

wallet_repeat_pk_msg = ⚠️ *Verificar Clave Privada* 

    Por favor ingresa los últimos 4 caracteres de tu clave privada abajo para verificar que la recordaste y almacenaste de forma segura:

wallet_repeat_pk_success_msg = ✅ *Clave Privada Verificada*

    Tu clave privada ha sido verificada exitosamente.

    Para comenzar a operar, usa el comando /start o haz clic en el botón de abajo:


wallet_success_msg =
    ✅ *Tu billetera ha sido creada exitosamente*

    • *Dirección de Billetera:* `{ $walletAddress }`

    • *Clave Privada:* `{ $privateKey }`

    ⚠️ *IMPORTANTE:* Mantén tu clave privada segura
    • No la compartas con nadie
    • No la almacenes digitalmente o en línea
    • Escríbela y guárdala en un lugar seguro

    ⏰ Este mensaje será eliminado en 5 minutos por seguridad

    Para comenzar a operar, usa el comando /start.


# error & status messages
error_msg = ❌ Algo salió mal. Por favor intenta de nuevo.
insufficient_funds_msg =
    ⚠️ Fondos insuficientes para completar la transacción.

    Por favor asegúrate de tener suficiente ETH para cubrir:
    • El monto de la transacción
    • Las comisiones de gas
invalid_amount_msg = ⚠️ Cantidad inválida seleccionada. Por favor selecciona una cantidad diferente.
invalid_token_msg = ⚠️ No se seleccionó token. Por favor selecciona un token primero.
invalid_price_msg = ⚠️ Precio inválido seleccionado. Por favor selecciona un precio diferente
no_wallet_msg = ⚠️ No tienes una billetera. Por favor crea una usando /wallet o haz clic en el botón de abajo:
no_private_key_msg = ⚠️ Clave privada no encontrada. Por favor intenta de nuevo o contacta soporte.
already_up_to_date_msg = ✨ ¡Ya está actualizado!
rate_limit_second_msg = ¡Por favor más despacio! Máximo 3 solicitudes por segundo.
rate_limit_minute_msg = Has excedido el límite de 50 solicitudes por minuto. Por favor espera.
rate_limit_15min_msg = Has excedido el límite de 300 solicitudes por 15 minutos. Por favor espera.
token_not_found_msg = ❌ Token no encontrado. Por favor verifica la dirección del contrato del token e intenta de nuevo.

# dca
dca_cancel_msg = ⭕ ¡La orden DCA ha sido cancelada exitosamente!
dca_confirm_msg =
    🔍 *Confirmar Orden DCA*

    Token: { $tokenSymbol } | { $tokenName }
    CA: `{ $token }`
    Cantidad: { $amount } ETH
    Intervalo: { $interval }
    Veces: { $times }

    Por favor confirma para crear la orden DCA:

dca_custom_amount_msg = Por favor ingresa la cantidad de ETH que quieres gastar en tu orden DCA:
dca_custom_interval_msg = Por favor ingresa el intervalo en horas para tu orden DCA:
dca_custom_times_msg = Por favor ingresa el número de veces (1-100) para tu orden DCA:
dca_interval_msg = Por favor selecciona el tiempo de intervalo para tu orden DCA:
dca_invalid_interval_msg = ⚠️ Intervalo inválido seleccionado. Por favor selecciona un intervalo diferente.
dca_invalid_times_msg = ⚠️ Número de veces inválido. Por favor ingresa un número entre 1 y 100.
dca_no_orders_msg = No se encontraron órdenes DCA activas.

dca_orders_found_msg = ✅ Órdenes DCA encontradas.
dca_success_msg =
    🎊 *¡Felicitaciones! ¡Tu orden DCA ha sido creada exitosamente!*

    Token: { $tokenSymbol } | { $tokenName }
    CA: `{ $token }`
    Cantidad: { $amount } ETH
    Intervalo: { $interval }
    Veces: { $times }

    ¡Puedes ver tus órdenes DCA abiertas usando /orders!

dca_times_msg = Por favor selecciona el número de veces para tu orden DCA:
dca_token_found_msg =
    ✅ *Token Encontrado*

    Símbolo: *{ $tokenSymbol }*
    Nombre: *{ $tokenName }*
    Precio: *{ $tokenPrice }*
    Cadena: { $tokenChain }

    Por favor selecciona cuánto ETH quieres gastar en { $tokenSymbol } para tu orden DCA.

    Ve a /settings para ajustar slippage y gas si la transacción falla.

dca_token_msg = Ingresa la dirección del contrato del token para DCA:

# deposit & withdraw
deposit_msg =
    📥 *Depositar ETH o Tokens*

    💰 *Billetera:* `{ $walletAddress }`

    📊 *Valor Total del Portafolio:* ${ $totalPortfolioValue }

    🔹 *Balance ETH:* { $ethBalance } ETH

    🔹 *Balances de Tokens:*
    { $formattedBalances }

    Importante:
    - Solo envía activos en la Red Base
    - Los depósitos de ETH usualmente se confirman en minutos
    - Nunca compartas tu clave privada con nadie

withdraw_select_amount_msg =
    📤 *Retirar ETH*

    Tu balance: { $ethBalance } ETH

    Por favor selecciona cuánto ETH quieres retirar:

    Importante:
    - Verifica dos veces la dirección de destino
    - Los retiros usualmente se confirman en minutos
    - Nunca compartas tu clave privada con nadie

withdraw_custom_amount_msg = Por favor ingresa la cantidad de ETH que quieres retirar:
withdraw_recipient_address_msg = Por favor ingresa la dirección de la billetera destinataria (0x...):
withdraw_insufficient_balance_msg = ⚠️ Balance insuficiente. Solo tienes { $balance } ETH pero quieres retirar { $amount } ETH.
withdraw_invalid_operation_msg = ⚠️ Operación de retiro inválida. Por favor intenta de nuevo.
withdraw_error_msg = ❌ Algo salió mal durante el retiro. Por favor intenta de nuevo.
withdraw_cancel_msg = ⭕ El retiro ha sido cancelado.
invalid_address_msg = ⚠️ Formato de dirección inválido. Por favor ingresa una dirección Ethereum válida que comience con 0x.
invalid_input_msg = ⚠️ Entrada inválida. Por favor intenta de nuevo.

withdraw_confirm_msg =
    🔍 *Confirmar Retiro*

    Cantidad: *{ $amount } ETH*
    A la Dirección: `{ $recipientAddress }`

    ¿Estás seguro que quieres proceder con este retiro?

withdraw_success_msg =
    🎊 *¡Retiro Exitoso!*

    • *Cantidad:* { $amount } ETH
    • *Desde:* { $walletAddress }
    • *A la Dirección:* `{ $recipientAddress }`

    Tu retiro ha sido enviado a la red y debería confirmarse en minutos.

    Revisa tu transacción en [BaseScan](https://basescan.org/tx/{ $txHash })

# sell
sell_cancel_msg = ⭕ ¡La orden de venta ha sido cancelada exitosamente!

sell_confirm_msg =
    🎯 *Confirmar Orden de Venta*

    📊 **Detalles:**
    • *Símbolo:* **${ $tokenSymbol }** | { $tokenName }
    • *Contrato:* `{ $tokenAddress }`

    💰 **Resumen de Transacción:**
    • *Vendiendo:* **{ $amount } { $tokenSymbol }** (≈ { $usdValue })

    Importante: Esta acción no se puede deshacer. Por favor revisa cuidadosamente.

    ¿Quieres proceder con esta venta?

sell_custom_amount_msg = Por favor ingresa la cantidad de tokens que quieres vender:
sell_error_msg = ❌ Algo salió mal durante la operación de venta. Por favor intenta de nuevo.
sell_insufficient_balance_msg = ⚠️ Balance insuficiente. Solo tienes { $balance } { $tokenSymbol }.
sell_invalid_operation_msg = ⚠️ Operación de venta inválida. Por favor intenta de nuevo.
sell_no_balance_msg = ⚠️ No tienes balance de este token para vender.
sell_success_msg =
    🎊 *¡Orden de Venta Exitosa!*

    Detalles de la Transacción:
    • Token: *{ $tokenSymbol }*
    • Cantidad Vendida: *{ $amount } { $tokenSymbol }*
    • Contrato: `{ $token }`
    
    Ver en [BaseScan](https://basescan.org/tx/{ $txHash })

    ¿Necesitas ayuda? Usa /help para ver problemas comunes y soluciones.

sell_token_found_msg = 
    ✅ *${ $tokenSymbol }* | *{ $tokenName }* en *{ $tokenChain }*

    Balance: *{ $balance } { $tokenSymbol }*

    Precio: *${ $tokenPrice }*

    Selecciona cuánto *${ $tokenSymbol }* quieres vender.

    Ve a /settings para ajustar slippage y gas si la transacción falla.

sell_token_msg = 
    💵 *Vender Token*

    🔹 *Balance ETH:* { $ethBalance } ETH

    🔹 *Balances de Tokens:*
    { $formattedSellBalances }

    Ingresa la dirección del contrato de un token que quieras vender:

# transactions
transactions_overview_msg =
    💳 *Historial de Transacciones*
    📊 *Total de Transacciones:* { $totalTransactions }
    ✅ *Exitosas:* { $successfulTrades }
    ❌ *Fallidas:* { $failedTrades }
    🟡 *Pendientes:* { $pendingTrades }
    💰 *Volumen Total:* { $totalVolume } ETH
    Selecciona lo que te gustaría ver:
recent_transactions_header_msg = 📋 *Transacciones Recientes (Últimas 10)*
all_transactions_header_msg = 
    📋 *Todas las Transacciones*
    
    Página { $page } de { $totalPages } (Total: { $total })
select_transaction_type_msg = 
    📊 *Seleccionar Tipo de Transacción*
    
    Elige qué tipo de transacciones te gustaría ver:
transactions_of_type_header_msg =
    📋 *Transacciones { $type }*
    
    Página { $page } de { $totalPages } (Total: { $total })
no_transactions_msg = 
    📋 *Sin Transacciones*
    
    Aún no has realizado ninguna transacción.
    
    ¡Comienza a operar con /buy, /sell, /dca, o /limit!
no_transactions_of_type_msg = 
    📋 *Sin Transacciones { $type }*
    
    Aún no has realizado ninguna transacción { $type }.
transaction_stats_header_msg = 📊 *Estadísticas de Transacciones*
transaction_stats_overview_msg = 
    📈 *Resumen:*
    • Total: { $totalTransactions }
    • Exitosas: { $successfulTrades }
    • Fallidas: { $failedTrades }
    • Pendientes: { $pendingTrades }
    • Volumen: { $totalVolume } ETH
transaction_stats_by_type_msg = 📊 *Por Tipo:*
# transaction formatting
transaction_item_msg =
    { $statusEmoji }{ $typeEmoji } *#{ $transactionNumber } { $type }*
    { $details }
    🕒 { $createdDate } { $createdTime }
    🔗 { $txHash } | ⛓️ { $chain }
transaction_buy_details_msg = Gastó { $tokenInAmount } { $tokenInSymbol } → { $tokenOutSymbol } ({ $tokenOutAmount })
transaction_sell_details_msg = Vendió { $tokenInAmount } { $tokenInSymbol } → { $tokenOutSymbol } ({ $tokenOutAmount })
transaction_dca_details_msg = DCA { $tokenInAmount } { $tokenInSymbol } → { $tokenOutSymbol } | { $times } veces | { $expire }
transaction_limit_details_msg = Límite { $tokenInAmount } { $tokenInSymbol } → { $tokenOutSymbol } ({ $tokenOutAmount }) | { $expire }
transaction_withdraw_details_msg = Retiró { $tokenInAmount } { $tokenInSymbol } a { $toAddress }
transaction_unknown_details_msg = Tipo de transacción desconocido

# orders
orders_overview_msg =
    📋 *Resumen de Órdenes*

    🔹 *Total Órdenes DCA:* { $totalDcaOrders }
    🔹 *Total Órdenes Límite:* { $totalLimitOrders }

    Para obtener más detalles sobre tus órdenes límite y DCA, haz clic en los botones de abajo:

# Order message
limit_orders_header_msg =
    📋 *Órdenes Límite*
    
    🟢 → Activa/Pendiente

    ✅ → Ejecutada/Completada  
    
    ❌ → Cancelada
    
    ⏰ → Expirada
    
    🔴 → Fallida
    
    🔵 → Desconocida

    ─────────────────

limit_order_item_msg =
    { $statusEmoji } *#{ $orderNumber } | { $makerSymbol } → { $takerSymbol }*
    • *Cantidad:* { $makerAmount } { $makerSymbol }
    • *Objetivo:* { $takerAmount } { $takerSymbol }
    • *Rango:* { $createdDate } → { $expiryDate }
    • *Hash:* `{ $orderHash }`
    • [Ver en OpenOcean]({ $openOceanLink })

dca_orders_header_msg = 📋 *Órdenes DCA*

    🟢 → Activa/Pendiente

    ✅ → Ejecutada/Completada  
    
    ❌ → Cancelada
    
    ⏰ → Expirada
    
    🔴 → Fallida
    
    🔵 → Desconocida

    ─────────────────

dca_order_item_msg =
    { $statusEmoji } *#{ $orderNumber } | { $makerSymbol } → { $takerSymbol }*
    • *Cantidad:* { $makerAmount } { $makerSymbol }
    • *Intervalo:* { $intervalText }
    • *Progreso:* { $progress }/{ $totalTimes } ejecuciones
    • *Rango:* { $createdDate } → { $expiryDate }
    • *Hash:* `{ $orderHash }`

orders_total_count_msg = Total de Órdenes: { $totalCount }

no_dca_orders_msg =
    📋 *Órdenes DCA*

    Aún no tienes órdenes DCA.

    Usa /dca para crear tu primera orden DCA.

no_limit_orders_msg =
    📋 *Órdenes Límite*

    Aún no tienes órdenes límite.

    Usa /limit para crear tu primera orden límite.


# Limit Order Messages
limit_token_msg = Por favor envía la dirección del contrato del token que quieres *vender* en tu orden límite:
limit_custom_amount_msg = Por favor ingresa la cantidad de tokens que quieres vender:
limit_target_token_msg =
    Por favor selecciona el token que quieres *recibir* cuando tu orden límite se ejecute:

    Puedes elegir de los tokens populares abajo o ingresar una dirección de token personalizada.
limit_custom_target_token_msg = Por favor ingresa la dirección del contrato del token que quieres recibir:
limit_invalid_price_msg = ❌ Precio inválido. Por favor ingresa un número válido mayor que 0.
limit_invalid_expiry_msg = ⚠️ Tiempo de expiración inválido. Por favor ingresa un tiempo de expiración válido (ej. 2H, 3D, 1W).
limit_price_msg = Por favor ingresa el precio por token (en unidades del token objetivo) para tu orden límite:
limit_expiry_msg = Por favor selecciona el tiempo de expiración para tu orden límite:
limit_custom_expiry_msg = Por favor ingresa el tiempo de expiración (ej. 2H, 3D, 1W):
limit_restart_msg = Por favor comienza de nuevo con el comando /limit.
limit_cancel_msg = ⭕ ¡La orden límite ha sido cancelada exitosamente!
limit_order_not_found_msg = ❌ Orden no encontrada o ya cancelada.

limit_no_orders_msg =
    📋 *No hay Órdenes Límite*

    Aún no tienes órdenes límite.

    Usa /limit para crear tu primera orden límite.

limit_token_found_msg =
    ✅ *Token Encontrado*

    Símbolo: *{ $tokenSymbol }*
    Nombre: *{ $tokenName }*
    Precio: *{ $tokenPrice }*
    Cadena: { $tokenChain }

    Por favor selecciona cuántos { $tokenSymbol } quieres *vender* en tu orden límite.

    Ve a /settings para ajustar slippage y gas si la transacción falla.

limit_order_created_msg =
    🎊 *¡Felicitaciones! ¡Tu orden límite ha sido creada exitosamente!*

    📊 *Detalles de la orden:*
    • *Venta:* { $amount } { $tokenSymbol }
    • *Recepción:* { $targetTokenSymbol }
    • *Precio:* { $price } { $targetTokenSymbol } por token
    • *Expiración:* { $expiry }

    🔑 *Hash de la orden:*
    `{ $orderHash }`

    📋 *Próximos pasos:*
    • Usa /orders para ver y gestionar tus órdenes
    • Ver en [OpenOcean]({ $openOceanLink })
    • La orden se ejecutará cuando el precio alcance tu objetivo

    💡 _Tu orden está activa y siendo monitoreada_
    
limit_order_cancel_success_msg =
    ✅ *Orden Límite Cancelada*

    Tu orden límite para { $makerSymbol } → { $takerSymbol } ha sido cancelada exitosamente.

    Usa /orders para ver tus órdenes restantes.

limit_confirm_msg =
    🔍 *Confirmar Orden Límite*

    Venta: { $tokenSymbol } | { $tokenName }
    CA: `{ $token }`
    Recepción: { $targetTokenSymbol } | { $targetTokenName }
    Cantidad: { $amount } { $tokenSymbol }
    Precio: { $price } { $targetTokenSymbol } por token
    Valor Total: { $totalValue } { $targetTokenSymbol }
    Expiración: { $expiry }

    { $feeEstimationFailed ->
        [true] ⚠️ *No se pudieron estimar las tarifas*
        *[other] ⛽ *Tarifa de Gas Estimada:*
    • { $gasEth } ETH (~${ $gasUsd })
    • _El costo real puede variar según las condiciones de la red_
    }

    Por favor confirma la creación de tu orden límite:

# settings
gas_priority_updated_msg = Prioridad de gas establecida en { $gasPriority }
slippage_updated_msg = Slippage establecido en { $slippage }
language_updated_msg = Idioma establecido en { $language }
set_gas_msg =
    ⛽ Establecer Prioridad de Gas

    Selecciona tu prioridad de gas preferida:

set_language_msg =
    🌎 Seleccionar Idioma

    Elige tu idioma preferido:

set_slippage_msg =
    📊 Establecer Tolerancia de Slippage

    Selecciona tu tolerancia de slippage preferida:

settings_msg =
    ⚙️ *Configuraciones*

    Configuraciones Actuales:
    • Slippage: { $slippage }
    • Idioma: { $language }
    • Prioridad de Gas: { $gasPriority }

    Mejores Prácticas:
    - Aumenta *slippage* a 1% para tokens menos líquidos
    - Establece *prioridad de gas* en alta para transacciones rápidas

    Por favor establece tus configuraciones deseadas abajo.

# help & referrals
help_msg =
    🆘 *Ayuda y Soporte*

    Inicio Rápido:
    • /start - Iniciar el bot
    • /wallet - Gestionar tu billetera
    • /buy - Comprar tokens cripto
    • /sell - Vender tokens cripto
    • /settings - Configurar ajustes del bot

    💡 *¿Cómo uso Neurodex?*
    Consulta nuestra [documentación](https://docs.neurodex.xyz) donde explicamos todo en detalle. Únete a nuestro chat de soporte para recursos adicionales.

    💰 *¿Dónde puedo encontrar mi código de referido?*
    Abre el menú /referrals para ver tu código de referido único. ¡Compártelo con amigos para ganar recompensas!

    💰 *¿Cuáles son las comisiones?*
    • Comisión de trading: 1% por transacción exitosa
    • Sin comisiones de suscripción
    • Sin cargos ocultos
    • Todas las funciones son gratuitas

    🔒 Consejos de Seguridad:
    • NUNCA compartas tus claves privadas o frases semilla
    • Los administradores NUNCA te escribirán primero
    • Usa solo enlaces oficiales de nuestro sitio web
    • Nunca almacenamos tus claves privadas o frases semilla. Al generar una nueva billetera - guarda tu clave privada en un lugar seguro.

    💡 Consejos de Trading:
    Problemas comunes y soluciones:
    • Slippage Excedido: Aumenta slippage o opera en cantidades menores
    • Saldo insuficiente: Agrega más fondos o reduce el monto de la transacción
    • Timeout de transacción: Aumenta la propina de gas durante alta carga de red

    ¿Necesitas más ayuda?
    Contacta nuestro equipo de soporte haciendo clic en el botón de abajo.

referral_msg =
    💎 *Programa de Referidos*

    Cómo funciona:
    1. Comparte tu enlace de referido de abajo con tus amigos y familia
    2. Cuando se registren usando tu enlace, ganas 10% de sus comisiones de trading
    3. ¡Puedes ganar recompensas ilimitadas!

    Tu Enlace de Referido:
    `{ $referral_link }`

    Aprende más sobre recompensas y niveles en nuestra [documentación](https://docs.neurodex.xyz/referral-program) oficial

referral_stats_msg =
    📊 *Estadísticas de Referidos*

    Usuarios Referidos: { $totalReferrals } usuarios
    Trades de Referidos: { $totalTrades } trades
    Volumen de Referidos: { $totalVolume }
    Total de Ganancias por Referidos: { $totalEarned }

    ¡Sigue difundiendo la palabra y mira crecer tus ganancias! 🚀

referral_success_notification_msg = 🥳 *¡Felicitaciones!* ¡Acabas de referir un nuevo usuario a Neurodex! ¡Estás creciendo con nosotros (y también tus recompensas)!


# buy
buy_amount_msg = Por favor ingresa la cantidad de ETH que deseas gastar:
buy_cancel_msg = ⭕ ¡La orden de compra ha sido cancelada exitosamente!
buy_confirm_msg =
    🔍 *Confirmar Orden de Compra*

    Token: *{ $tokenSymbol }* | { $tokenName }
    CA: `{ $token }`
    Cantidad: *{ $amount } ETH*

    ¿Estás seguro que deseas proceder con esta compra?

buy_error_msg = ❌ Algo salió mal durante la operación de compra. Por favor intenta de nuevo.
buy_success_msg =
    🎊 *¡Felicitaciones! Tu orden de compra por { $amount } { $tokenSymbol } ha sido creada exitosamente!*

    Detalles de la transacción:
    • Cantidad: { $amount } { $tokenSymbol }
    • Token: { $token }
    • Transacción: https://basescan.org/tx/{ $txHash }

    Revisa tu transacción en [BaseScan](https://basescan.org/tx/{ $txHash })
buy_token_found_msg =
    ✅ *Token Encontrado*

    Símbolo: *${ $tokenSymbol }*
    Nombre: *{ $tokenName }*
    Precio: ${ $tokenPrice }
    Cadena: { $tokenChain }

    Por favor selecciona cuánto ETH deseas gastar en { $tokenSymbol }.

    Ve a /settings para ajustar el slippage y gas si la transacción falla.

buy_token_msg = Ingresa la dirección del contrato del token a comprar: