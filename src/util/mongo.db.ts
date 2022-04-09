import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config()
const mongoClient = new MongoClient(process.env.mongodb, {useNewUrlParser: true, useUnifiedTopology: true})

async function run() {
  try {
    await mongoClient.connect();
    await mongoClient.db("admin").command({ ping: 1 });
    console.info("Connected successfully to server");
  } finally {
    await mongoClient.close();
  }
}
run().catch(console.dir);

export default mongoClient
