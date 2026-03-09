import type { ConfirmChannel } from "amqplib";

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