/* eslint-disable node/prefer-global/process */
import dotenv from 'dotenv'
import Redis from 'ioredis'

import { NotificationHandlerFactory } from './factories/notificationHandlerFactory'
import { startSocketServer } from './utils/sockets'

dotenv.config()

startSocketServer()

const consumer = `consumer-${Math.random()}`

const redisPort = Number(process.env.REDIS_PORT) || 6379
const redisHost = process.env.REDIS_HOST
const redisPassword = process.env.REDIS_PASSWORD

const redis = new Redis({
  port: redisPort,
  host: redisHost,
  password: redisPassword,
})

async function createConsumerGroup(stream: string, group: string) {
  try {
    await redis.xgroup('CREATE', stream, group, '0', 'MKSTREAM')
  }
  catch (err: any) {
    if (err.message.includes('BUSYGROUP'))
      console.log(`Группа потребителей ${group} уже существует. Продолжаем работу.`)
    else
      throw err
  }
}

async function handleMessage(group: string, messageId: string, message: string) {
  try {
    const event: any = JSON.parse(message)
    const handler = NotificationHandlerFactory.createHandler(group, event.type)

    if (handler)
      await handler.handle(event.event)
    else
      console.log(`Не найден обработчик для группы: ${group} и типа: ${event.type}`)

    await redis.xack('notifications', group, messageId)
  }
  catch (e: any) {
    console.error('error: ', e.message)
  }
}

async function consumeMessages(group: string) {
  while (true) {
    const result: any = await redis.xreadgroup('GROUP', group, consumer, 'COUNT', '0', 'BLOCK', '10', 'STREAMS', 'notifications', '>')
    if (result) {
      for (const [_stream, messages] of result) {
        for (const [messageId, messageData] of messages) {
          const message = messageData[1]
          await handleMessage(group, messageId, message)
        }
      }
    }
  }
}

// Главная функция выполнения
(async () => {
  const groups = [`${process.env.COOPNAME}-email`, `${process.env.COOPNAME}-websocket`] // push
  for (const group of groups)
    await createConsumerGroup('notifications', group)

  // Запуск потребителей для каждой группы
  groups.forEach(group => consumeMessages(group))
})()
