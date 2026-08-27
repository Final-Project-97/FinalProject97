import dotenv from 'dotenv';
import app from './app.js';
import './config/database.js';
import { startExpiryCron } from './subscription/expiry.job.js';

dotenv.config();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`[Server] Berjalan sukses di port ${PORT}`);
  startExpiryCron();
});