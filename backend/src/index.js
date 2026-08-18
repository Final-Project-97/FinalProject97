import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './database.js';
import { startExpiryCron } from './subscription/expiry.job.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[Server] Berjalan sukses di port ${PORT}`);
      startExpiryCron();
    });
  } catch (error) {
    console.error('[Server] Gagal menyalakan server:', error);
    process.exit(1);
  }
}

startServer();