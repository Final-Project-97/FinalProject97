// backend/src/database.js
import { MongoClient } from 'mongodb';
import { MONGODB_URI, MONGODB_DB_NAME } from './config/database.js';

let client;
let db;

export const connectDB = async () => {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(MONGODB_DB_NAME); 
    console.log(`[Database] Connected: ${MONGODB_DB_NAME}`);
  }
  return db;
};

export const getDB = () => db;