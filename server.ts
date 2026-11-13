import app from './src/app.ts'
import 'dotenv/config'
import { closeMongo, connectMongo } from './src/db/mongodb.ts'
import { ensureMessageIndexes } from './src/repositories/chat/messageRep.ts'
import dataBase, { connectMariaDB } from './src/db.ts'
import createLoader from './src/utils/terminalLoader.ts';
import verifyProjectIdentity from "./src/utils/verifyProjectIdentity.ts";

let server: ReturnType<typeof app.listen> | null = null;
let isShuttingDown = false;
let shutdownFailed = false;

let timer: ReturnType<typeof setTimeout>;

async function shutdown(signal:string) {

  if(isShuttingDown) return;

  isShuttingDown = true;
  console.log(`${signal} received. Shutting down...`);

  try {

    const currentServer = server;

    if(currentServer){

      const closePromise =
        new Promise<void>((resolve, reject)=>{
          currentServer.close((error) => {
            if(error){
              reject(error);
              return;
            }
            resolve();
          })
        });


      const timeOutPromise = new Promise<'timeout'>((resolve) => {
        timer = setTimeout(() => resolve('timeout'), 10_000);
      });

      try{
        const result = await Promise.race([
          closePromise.then(() => 'closed' as const),
          timeOutPromise
        ]);

        if (result === 'timeout') {
          console.warn('Shutdown timeout. Forcing connections closed...');

          currentServer.closeAllConnections();

          await closePromise;
        }
      }finally{
        clearTimeout(timer);
      }
   }

  } catch (error) {
    shutdownFailed = true;
    console.error('HTTP shutdown failed:', error)
  }finally {

    const result = await Promise.allSettled([
      dataBase.end(),
      closeMongo()
    ]);

    result.forEach(result => {
      if(result.status === "rejected"){
        shutdownFailed = true;
        console.error('Database cleanup failed:', result.reason);
      }
    });

  }

  process.exitCode = shutdownFailed ? 1 : 0;

  if (shutdownFailed) {
    console.error('Server shutdown completed with errors');
  } else {
    console.log('Server shutdown completed successfully');
  }

}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

async function startServer() {

  let mariaConnected = false;
  let mongoConnected = false;

  const loader = createLoader();

  try {
    verifyProjectIdentity();

    await loader.update('Connecting to MongoDB...');

    await connectMongo();
    mongoConnected = true;
    await ensureMessageIndexes();

    await loader.update('MongoDB connected');

    await loader.update('Connecting to MariaDB...');

    await connectMariaDB();
    mariaConnected = true;

    await loader.update('MariaDB connected');

    await loader.update('Starting HTTP server...');

    server = app.listen(4000);

    await new Promise<void>((resolve, reject) => {
      server!.once('listening', resolve);
      server!.once('error', reject);
    });

    loader.stop('SERVER ONLINE · PORT 4000');

  } catch (error) {
    loader.stop('SERVER STARTUP FAILED', false);

    if (server?.listening) {
      await new Promise<void>(resolve => {
        server!.close(() => resolve());
      });
    }

    if (mariaConnected) await dataBase.end();
    if (mongoConnected) await closeMongo();

    console.error(error);
    process.exitCode = 1;
  }
}

startServer();