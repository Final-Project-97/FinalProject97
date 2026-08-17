import dotenv from 'dotenv';
import '../src/config/database.js';
import { runExpiryJob } from '../src/subscription/expiry.job.js';

dotenv.config();

await runExpiryJob();
process.exit(0);