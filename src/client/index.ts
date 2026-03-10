import amqp from 'amqplib'
import { clientWelcome, commandStatus, getInput, printClientHelp, printQuit } from '../internal/gamelogic/gamelogic.js'
import { declareAndBind, SimpleQueueType, subscribeJSON } from '../internal/pubsub.js'
import { ExchangePerilDirect, PauseKey } from '../internal/routing/routing.js'
import { GameState } from '../internal/gamelogic/gamestate.js'
import { commandSpawn } from '../internal/gamelogic/spawn.js'
import { commandMove } from '../internal/gamelogic/move.js'
import { handlerPause } from './handlers.js'

async function main() {
  const rabbitConnString = 'amqp://guest:guest@localhost:5672/'
    const conn = await amqp.connect(rabbitConnString)
    console.log("connection was successful.")
    const username= await clientWelcome()

    const state = new GameState(username)
    subscribeJSON(
      conn, 
      ExchangePerilDirect, 
      `pause.${username}`, 
      PauseKey, 
      SimpleQueueType.Transient,
      handlerPause(state)
    )
    while(true){
        const words = await getInput()
        if(words.length > 0){
          if(words[0] === 'spawn'){
            commandSpawn(state, words)
          }else if(words[0] === 'move'){
            try{
              const success = commandMove(state, words)
              console.log('move successfull')
            }catch(err){
              console.log((err as Error).message)
            }
          }else if(words[0] === 'status'){
            commandStatus(state)
          }else if(words[0] === 'spam'){
            console.log("Spamming not allowed yet!")
          }else if(words[0] === 'quit'){
            printQuit()
            process.exit(0)
          }else if(words[0] === 'help'){
            printClientHelp()
          }else{
            console.log("command not found")
          }
        }
    }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
