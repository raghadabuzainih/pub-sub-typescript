import amqp from 'amqplib'
import { publishJSON } from '../internal/pubsub.js'
import { ExchangePerilDirect, PauseKey } from '../internal/routing/routing.js'

async function main() {
  const rabbitConnString = 'amqp://guest:guest@localhost:5672/'
  const conn = await amqp.connect(rabbitConnString)
  console.log("connection was successful.")

  //create a channel
  const channel = await conn.createConfirmChannel()
  //publish msg from this channel
  publishJSON(channel, ExchangePerilDirect, PauseKey, {isPaused: true})

  process.on('exit', async()=>{
    console.log('The program is shutting down')
    await conn.close()
  })
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
