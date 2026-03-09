import amqp from 'amqplib'
import { publishJSON } from '../internal/pubsub.js'
import { ExchangePerilDirect, PauseKey } from '../internal/routing/routing.js'
import { getInput, printServerHelp } from '../internal/gamelogic/gamelogic.js'

async function main() {
  const rabbitConnString = 'amqp://guest:guest@localhost:5672/'
  const conn = await amqp.connect(rabbitConnString)
  console.log("connection was successful.")

  //create a channel
  const channel = await conn.createConfirmChannel()
  //publish msg from this channel
  publishJSON(channel, ExchangePerilDirect, PauseKey, {isPaused: true})

  printServerHelp()
  while(true){
    const words = await getInput()
    if(words.length > 0){
      if(words[0] === 'pause'){
        console.log('i am sending a pause message')
        publishJSON(channel, ExchangePerilDirect, PauseKey, {isPaused: true})
      }else if(words[0] === 'resume'){
        console.log('i am sending a resume message')
        publishJSON(channel, ExchangePerilDirect, PauseKey, {isPaused: false})
      }else if(words[0] === 'quit'){
        console.log('i am exiting')
        break
      }else console.log("i don't understand the command")
    }
  }

  process.on('exit', async()=>{
    console.log('The program is shutting down')
    await conn.close()
  })
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
