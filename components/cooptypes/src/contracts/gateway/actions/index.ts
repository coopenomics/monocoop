/**
 * Вызывается техническим аккаунтом кооператива для создания объекта депозита со статусом платежа.
 */
export * as CreateDeposit from './createDeposit'

/*
 * Действие используется для установки статуса депозита в 'completed' и обновления его заметки.
 * Это действие также производит выпуск токенов учёта на лицевой счёт пользователя, основываясь на данных депозита.
 */
export * as CompleteDeposit from './completeDeposit'

/**
 * Действие используется для отмены платежа вступительного или паевого взноса.
 */
export * as RefundDeposit from './refundDeposit'

/**
 * Действие вызывается контрактом автоматически по ходу выполнения логики для возврата идентификатора нового депозита.
 * @private
 */
export * as NewDepositId from './newDepositId'

/**
 * Действие вызывается контрактом автоматически по ходу выполнения логики для возврата идентификатора нового депозита.
 * @private
 */
export * as NewWithdrawId from './newWithdrawId'

/**
 * Действие вызывается для создания заявки на возврат паевого взноса пользователем.
 */
export * as CreateWithdraw from './createWithdraw'

/**
 *
 * Действие вызывается администратором для подтверждения платежа по возврату паевого взноса пользователю.
 */
export * as CompleteWithdraw from './completeWithdraw'

/**
 *
 * Действие вызывается администратором для информировании пользователя о возникновании ошибки в процессе возврата паевого взноса.
 */
export * as FailWithdraw from './failWithdraw'
