import type { Channel, ConfirmChannel } from "amqplib";
import amqp from 'amqplib'

export function publishJSON<T>(
  ch: ConfirmChannel,
  exchange: string,
  routingKey: string,
  value: T,
){
    const json = JSON.stringify(value)
    const buffer = Buffer.from(json)
    ch.publish(exchange,routingKey, buffer, {contentType: 'application/json'})
}

export enum SimpleQueueType {
  Durable,
  Transient,
}

export async function declareAndBind(
  conn: amqp.ChannelModel,
  exchange: string,
  queueName: string,
  key: string,
  queueType: SimpleQueueType,
): Promise<[Channel, amqp.Replies.AssertQueue]>{

    const channel = await conn.createChannel()
    const queue = await channel.assertQueue(queueName, {
        durable: queueType === SimpleQueueType.Durable ? true : false,
        autoDelete: queueType === SimpleQueueType.Transient ? true : false,
        exclusive: queueType === SimpleQueueType.Transient ? true : false,
    })

    await channel.bindQueue(queue.queue, exchange, key)
    
    return [channel, queue]
}

export async function subscribeJSON<T>(
  conn: amqp.ChannelModel,
  exchange: string,
  queueName: string,
  key: string,
  queueType: SimpleQueueType,
  handler: (data: T) => void,
): Promise<void>{
  
  const [channel, queue] = await declareAndBind(conn, exchange, queueName, key, queueType)
  channel.consume(queue.queue, (msg: amqp.ConsumeMessage | null)=> {
    if(msg === null) return
    const content = JSON.parse(msg.content.toString())
    handler(content)
    channel.ack(msg)
  })
}