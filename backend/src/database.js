import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

let client;
let db;

export const connectDB = async () => {
  try {
    if (!client) {
      // Membuat instance MongoClient baru menggunakan URI dari file .env
      client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();

      // nama database 'rac_ai_db'
      db = client.db("rac_ai_db");
      console.log(
        "[Database] Berhasil terhubung ke MongoDB via Native Driver & Mongoloquent stack",
      );
    }
    return db;
  } catch (error) {
    console.error("[Database] Gagal terhubung ke MongoDB:", error.message);
    process.exit(1);
  }
};

export const getDB = () => db;
