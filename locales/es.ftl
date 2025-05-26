start_msg =
    💸 *Neurodex*

    Neurodex es tu bot de trading de criptomonedas ultrarrápido

    Compra y vende criptomonedas fácilmente con Neurodex.

    /buy - Comprar cualquier token cripto en Base, BSC y Ethereum
    /sell - Vender cualquier token cripto en Base, BSC y Ethereum
    /dca - Promedio de Costo en Dólares (DCA)
    /limit - Crear órdenes límite
    /wallet - Gestionar tu billetera
    /settings - Configurar ajustes del bot
    /help - Obtener ayuda y soporte

    Desarrollado por [Neurobro](https://neurobro.ai) y [Docs](https://docs.neurodex.xyz)

accept_terms_conditions_msg =
    💸 *Bienvenido a Neurodex*

    Antes de comenzar, por favor revisa y acepta nuestros términos de servicio y política de privacidad.

    • [Términos de Servicio](https://docs.neurodex.xyz/terms-of-service)
    • [Política de Privacidad](https://docs.neurodex.xyz/privacy-policy)

wallet_success_msg =
    ✅ *Tu billetera ha sido creada exitosamente*

    Dirección de Billetera: { $walletAddress }
    Clave Privada: { $privateKey }

    ⚠️ *IMPORTANTE:* Mantén tu clave privada segura
    • No la compartas con nadie
    • No la almacenes digitalmente o en línea
    • Escríbela y guárdala en un lugar seguro

    ⏰ Este mensaje será eliminado en 5 minutos por seguridad

    Para comenzar a operar, usa el comando /start.

wallet_fail_msg =
    ❌ *Falló la Creación de Billetera*

    Algo salió mal. Por favor intenta de nuevo o ve a /help.

wallet_msg =
    💰 *Billetera:* { $walletAddress }

    Saldo: { $ethBalance } ETH

    Para depositar fondos, por favor envía tus monedas a la dirección de billetera de arriba.

wallet_repeat_pk_error_msg = ❌ *Verificación de Clave Privada Fallida*
    
    Los últimos 4 caracteres que ingresaste no coinciden con tu clave privada. Por favor intenta de nuevo abajo:

wallet_repeat_pk_msg = ⚠️ *Verificar Clave Privada* 

    Por favor ingresa los últimos 4 caracteres de tu clave privada abajo para verificar que la recordaste y almacenaste de forma segura:

wallet_repeat_pk_success_msg = ✅ *Clave Privada Verificada*

    Tu clave privada ha sido verificada exitosamente.

    Para comenzar a operar, usa el comando /start o haz clic en el botón de abajo:

wallet_create_msg =
    💸 *Neurodex*

    Neurodex es tu bot de trading de criptomonedas ultrarrápido

    Para poder /buy, /sell o realizar cualquier otra acción, primero debes crear una billetera. Crea una ahora haciendo clic en el botón de abajo.

    Para ayuda con la configuración, por favor consulta [esta guía](https://docs.neurodex.xyz/getting-started/setup) u obtén /help.

buy_token_msg = Ingresa la dirección del contrato del token para comprar:
dca_token_msg = Ingresa la dirección del contrato del token para DCA:
error_msg = ❌ La transacción falló. Por favor intenta más tarde.
invalid_amount_msg = ⚠️ Cantidad inválida seleccionada. Por favor selecciona una cantidad diferente.
invalid_price_msg = ⚠️ Precio inválido seleccionado. Por favor selecciona un precio diferente.

insufficient_funds_msg =
    ⚠️ Fondos insuficientes para completar la transacción.

    Por favor asegúrate de tener suficiente ETH para cubrir:
    • El monto de la transacción
    • Las comisiones de gas

invalid_token_msg = ❌ No se seleccionó token. Por favor selecciona un token primero.
no_private_key_msg = ⚠️ Clave privada no encontrada. Por favor intenta de nuevo o contacta soporte.
already_up_to_date_msg = ✨ ¡Ya está actualizado!
rate_limit_second_msg = ¡Por favor más despacio! Máximo 3 solicitudes por segundo.
rate_limit_minute_msg = Has excedido el límite de 50 solicitudes por minuto. Por favor espera.
rate_limit_15min_msg = Has excedido el límite de 300 solicitudes por 15 minutos. Por favor espera.
token_not_found_msg = ❌ Token no encontrado. Por favor verifica la dirección del contrato del token e intenta de nuevo.

dca_times_msg = Por favor selecciona el número de veces para tu orden DCA:
dca_interval_msg = Por favor selecciona el tiempo de intervalo para tu orden DCA:
dca_custom_amount_msg = Por favor ingresa la cantidad de ETH que quieres gastar en tu orden DCA:
dca_custom_interval_msg = Por favor ingresa el intervalo en horas para tu orden DCA:
dca_custom_times_msg = Por favor ingresa el número de veces (1-100) para tu orden DCA:
dca_invalid_interval_msg = ⚠️ Intervalo inválido seleccionado. Por favor selecciona un intervalo diferente.
dca_invalid_times_msg = ⚠️ Número de veces inválido. Por favor ingresa un número entre 1 y 100.

dca_confirm_msg =
    🔍 *Confirmar Orden DCA*

    Token: { $tokenSymbol } | { $tokenName }
    CA: `{ $token }`
    Cantidad: { $amount } ETH
    Intervalo: { $interval }
    Veces: { $times }

    Por favor confirma para crear la orden DCA:

dca_token_found_msg =
    ✅ *Token Encontrado*

    Símbolo: *{ $tokenSymbol }*
    Nombre: *{ $tokenName }*
    Precio: *{ $tokenPrice }*
    Cadena: { $tokenChain }

    Por favor selecciona cuánto ETH quieres gastar en { $tokenSymbol } para tu orden DCA.

    Ve a /settings para ajustar slippage y gas si la transacción falla.

withdraw_msg =
    📤 *Retirar ETH u otros tokens*

    Tu saldo:
    - ETH: { $ethBalance }

    Importante:
    - Verifica dos veces la dirección de destino
    - Los retiros usualmente se confirman en minutos
    • Nunca compartas tu clave privada con nadie

deposit_msg =
    📥 *Depositar ETH o Tokens*

    ETH: { $ethBalance }

    Envía ETH o cualquier token ERC-20 a tu billetera: `{ $walletAddress }`

    Importante:
    - Solo envía activos en la Red Base
    - Los depósitos de ETH usualmente se confirman en minutos
    • Nunca compartas tu clave privada con nadie

no_registration_msg =
    ❌ No estás registrado.

    Por favor usa /start para comenzar.

no_wallet_msg =
    ❌ No tienes una billetera.

    Por favor usa /wallet para crear una.

sell_token_msg = Ingresa la dirección del contrato de un token que quieras vender:

sell_token_found_msg =
    ✅ *Token Encontrado*

    Símbolo: *{ $tokenSymbol }*
    Nombre: *{ $tokenName }*
    Precio: *{ $tokenPrice }*
    Cadena: { $tokenChain }

    Por favor selecciona cuánto { $tokenSymbol } quieres vender.

    Ve a /settings para ajustar slippage y gas si la transacción falla.

sell_confirm_msg =
    🔍 *Confirmar Orden de Venta*

    Token: *{ $tokenSymbol }* | { $tokenName }
    CA: `{ $tokenAddress }`
    Cantidad: *{ $amount } { $tokenSymbol }*

    ¿Estás seguro de que quieres proceder con esta venta?

sell_custom_amount_msg = Por favor ingresa la cantidad de tokens que quieres vender:
sell_balance_fetch_error_msg = ❌ No se pudo obtener el saldo de la billetera. Por favor intenta de nuevo.
sell_no_balance_msg = ❌ No tienes saldo de este token para vender.
sell_insufficient_balance_msg = ❌ Saldo insuficiente. Solo tienes { $balance } { $tokenSymbol }.
sell_invalid_operation_msg = ❌ Operación de venta inválida. Por favor intenta de nuevo.
sell_private_key_error_msg = ❌ Clave privada no encontrada. Por favor intenta de nuevo.
sell_order_cancelled_msg = ✅ ¡La orden de venta ha sido cancelada exitosamente!
sell_success_msg =
    ✅ ¡La orden de venta de { $amount } { $tokenSymbol } fue exitosa!

    Detalles de la transacción:
    • Cantidad: { $amount } { $tokenSymbol }
    • Token: { $token }
    • Transacción: https://basescan.org/tx/{ $txHash }

help_msg =
    Ayuda y Soporte

    Inicio Rápido:
    • /start - Iniciar el bot
    • /wallet - Gestionar tu billetera
    • /buy - Comprar tokens cripto
    • /sell - Vender tokens cripto
    • /settings - Configurar ajustes del bot

    ¿Cómo uso Neurodex?
    Consulta nuestra [documentación](https://docs.neurodex.xyz) donde explicamos todo en detalle. Únete a nuestro chat de soporte para recursos adicionales.

    💰 ¿Dónde puedo encontrar mi código de referido?
    Abre el menú /referrals para ver tu código de referido único. ¡Compártelo con amigos para ganar recompensas!

    ¿Cuáles son las comisiones?
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
    • Slippage Excedido: Aumenta el slippage o opera en cantidades menores
    • Saldo insuficiente: Agrega más fondos o reduce el monto de la transacción
    • Tiempo de espera de transacción: Aumenta la propina de gas durante alta carga de red

    ¿Necesitas más ayuda?
    Contacta a nuestro equipo de soporte haciendo clic en el botón de abajo.

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
    Operaciones Referidas: { $totalTrades } operaciones
    Volumen Referido: { $totalVolume }
    Ganancias Totales por Referidos: { $totalEarned }

    ¡Sigue difundiendo la palabra y mira crecer tus ganancias! 🚀

referral_success_notification_msg = 🥳 *¡Boom!* ¡Acabas de referir a un nuevo usuario a Neurodex! ¡Estás creciendo el movimiento — y tus recompensas!

settings_msg =
    ⚙️ *Configuraciones*

    Configuraciones Actuales:
    • Slippage: { $slippage }
    • Idioma: { $language }
    • Prioridad de Gas: { $gasPriority }

    Mejores Prácticas:
    - Aumenta el *slippage* a 1% para tokens menos líquidos
    - Establece la *prioridad de gas* en alta para transacciones rápidas

    Por favor establece tus configuraciones deseadas abajo.

set_slippage_msg =
    📊 Establecer Tolerancia de Slippage

    Selecciona tu tolerancia de slippage preferida:

set_language_msg =
    🌎 Seleccionar Idioma

    Elige tu idioma preferido:

set_gas_msg =
    ⛽ Establecer Prioridad de Gas

    Selecciona tu prioridad de gas preferida:

slippage_updated_msg = Slippage establecido en { $slippage }
language_updated_msg = Idioma establecido en { $language }
gas_priority_updated_msg = Prioridad de gas establecida en { $gasPriority }

dca_order_cancelled_msg = ✅ ¡La orden DCA ha sido cancelada exitosamente!
dca_no_active_orders_msg = ❌ No se encontraron órdenes DCA activas para cancelar.
dca_orders_found_msg = ✅ Órdenes DCA encontradas.
dca_no_orders_msg = ❌ No se encontraron órdenes DCA activas.
dca_cancel_failed_msg = ❌ No se pudo cancelar la orden DCA. Por favor intenta más tarde.
dca_order_created_msg =
    🎊 *¡Felicitaciones! ¡Tu orden DCA ha sido creada exitosamente!*

    Token: { $tokenSymbol } | { $tokenName }
    CA: `{ $token }`
    Cantidad: { $amount } ETH
    Intervalo: { $interval }
    Veces: { $times }

    ¡Puedes ver tus órdenes DCA abiertas usando /orders!

# Limit Order Messages
limit_token_msg = Por favor envía la dirección del contrato del token para el que quieres crear una orden límite:
limit_custom_amount_msg = Por favor ingresa la cantidad de tokens que quieres comprar:
limit_error_msg = ❌ No se pudo crear la orden límite. Por favor intenta más tarde.
limit_invalid_price_msg = ❌ Precio inválido. Por favor ingresa un número válido mayor que 0.
limit_invalid_expiry_msg = ⚠️ Tiempo de expiración inválido. Por favor ingresa un tiempo de expiración válido (ej. 2H, 3D, 1W).
limit_price_msg = Por favor ingresa el precio por token (en ETH) para tu orden límite:
limit_expiry_msg = Por favor selecciona el tiempo de expiración para tu orden límite:
limit_custom_expiry_msg = Por favor ingresa el tiempo de expiración (ej. 2H, 3D, 1W):
limit_restart_msg = Por favor comienza de nuevo con el comando /limit.
limit_no_order_msg = No hay orden límite para confirmar.
limit_private_key_error_msg = ❌ No se pudo obtener la clave privada de la billetera.
limit_token_info_error_msg = ❌ No se pudo obtener información del token.
limit_order_cancelled_msg = ❌ Creación de orden límite cancelada.
limit_no_wallet_msg = ❌ No se encontró billetera. Por favor crea una billetera primero.
limit_order_details_error_msg = ❌ No se pudieron obtener los detalles de la orden.
limit_order_not_found_msg = ❌ Orden no encontrada o ya cancelada.
limit_loading_orders_msg = 📋 Cargando tus órdenes límite...
limit_create_error_msg = ❌ No se pudo crear la orden límite: { $error }
limit_retrieve_error_msg = ❌ No se pudieron obtener las órdenes límite: { $error }
limit_cancel_error_msg = ❌ No se pudo cancelar la orden límite: { $error }

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

    Por favor selecciona cuánto { $tokenSymbol } quieres comprar en tu orden límite.

    Ve a /settings para ajustar slippage y gas si la transacción falla.

limit_order_created_msg =
    ✅ *¡Orden Límite Creada Exitosamente!*

    Token: { $tokenSymbol }
    Cantidad: { $amount } { $tokenSymbol }
    Precio: { $price } ETH por token
    Expiración: { $expiry }

    Tu orden límite ha sido enviada a la red. Se ejecutará cuando el precio de mercado alcance tu precio objetivo.

    Usa /orders para ver todas tus órdenes.

limit_order_cancel_success_msg =
    ✅ *Orden Límite Cancelada*

    Tu orden límite para { $makerSymbol } → { $takerSymbol } ha sido cancelada exitosamente.

    Usa /orders para ver tus órdenes restantes.

limit_confirm_msg =
    🔍 *Confirmar Orden Límite*

    Token: { $tokenSymbol } | { $tokenName }
    CA: `{ $token }`
    Cantidad: { $amount } { $tokenSymbol }
    Precio: { $price } ETH por token
    Valor Total: { $totalValue } ETH
    Expiración: { $expiry }

    Por favor confirma para crear la orden límite:

# buy
buy_amount_msg = Por favor ingresa la cantidad de ETH que quieres gastar:

buy_confirm_msg =
    🔍 *Confirmar Orden de Compra*

    Token: *{ $tokenSymbol }* | { $tokenName }
    CA: `{ $token }`
    Cantidad: *{ $amount } ETH*

    ¿Estás seguro de que quieres proceder con esta compra?

buy_error_msg = ❌ Algo salió mal durante la operación de compra. Por favor intenta de nuevo.
buy_success_msg =
    🎊 *¡Felicitaciones! ¡Tu orden de compra de { $amount } { $tokenSymbol } ha sido creada exitosamente!*

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

    Por favor selecciona cuánto ETH quieres gastar en { $tokenSymbol }.

    Ve a /settings para ajustar slippage y gas si la transacción falla.

buy_token_msg = Ingresa la dirección del contrato del token para comprar: