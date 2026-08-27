import { Database } from 'mongoloquent';
import '../src/config/database.js';
import { MONGODB_URI, MONGODB_DB_NAME } from '../src/config/database.js';

async function createIndexes() {
  const db = Database.getDb(MONGODB_URI, MONGODB_DB_NAME);

  // users — ERD §4.1
  await db.collection('users').createIndexes([
    { key: { email: 1 }, unique: true, name: 'users_email_unique' },
    {
      key: { googleId: 1 },
      unique: true,
      sparse: true, // boleh null untuk user lokal
      name: 'users_googleId_unique_sparse',
    },
  ]);

  // subscriptions — ERD §4.4
  await db.collection('subscriptions').createIndexes([
    { key: { userId: 1 }, unique: true },
    { key: { orderId: 1 }, unique: true },
    { key: { expiresAt: 1 } },
  ]);

  // wishlists — ERD §4.3
  await db.collection('wishlists').createIndexes([
    { key: { userId: 1, carId: 1 }, unique: true },
    { key: { userId: 1, createdAt: -1 } },
  ]);

  // ai_usage_logs — ERD §4.5
  await db.collection('ai_usage_logs').createIndexes([
    { key: { userId: 1, createdAt: -1 } },
    { key: { feature: 1, createdAt: -1 } },
  ]);

  await db.collection('cars').createIndexes([
    { key: { slug: 1 }, unique: true, name: 'cars_slug_unique' },
    { key: { brand: 1, type: 1 }, name: 'cars_brand_type' },
    { key: { isTopProduct: 1, status: 1 }, name: 'cars_top_status' },
    {
      key: { externalSource: 1, externalId: 1 },
      unique: true,
      sparse: true,
      name: 'cars_external_unique',
    },
    { key: { status: 1 }, name: 'cars_status' },
  ]);

  console.log('ML-01 + AL-02 indexes OK');
  process.exit(0);
}

createIndexes().catch((err) => {
  console.error(err);
  process.exit(1);
});