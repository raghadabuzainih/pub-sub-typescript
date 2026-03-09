import amqp from 'amqplib'

async function main() {
  const rabbitConnString = 'amqp://guest:guest@localhost:5672/'
  const conn = await amqp.connect(rabbitConnString)
  console.log("connection was successful.")
  process.on('exit', async()=>{
    console.log('The program is shutting down')
    await conn.close()
  })
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
