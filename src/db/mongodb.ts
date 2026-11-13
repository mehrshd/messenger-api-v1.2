import 'dotenv/config'
import { MongoClient, type Db } from 'mongodb'

const uri = process.env.MONGO_URI
const dbName = process.env.MONGO_DB

if (!uri || !dbName) {
  throw new Error('MongoDB environment variables are missing')
}

const client = new MongoClient(uri)

let database: Db | null = null

async function connectMongo(): Promise<Db> {

  try {

    await client.connect()

    database = client.db(dbName)

    await database.command({ ping: 1 })

    console.log('MongoDB connected successfully')

    return database

  } catch (error) {
    await closeMongo();
    throw error;
  }
}

function getMongoDb(): Db {
  if (!database) {
    throw new Error('MongoDB is not connected')
  }

  return database
}

async function closeMongo(): Promise<void> {
  await client.close()
  database = null
}

export {
  connectMongo,
  getMongoDb,
  closeMongo
}