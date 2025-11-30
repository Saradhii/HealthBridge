import { db, closeDbConnection } from '../src/db/utils';
import { sql } from 'drizzle-orm';

async function resetDatabase() {
  console.log('Dropping all tables...');

  await db.execute(sql`DROP TABLE IF EXISTS password_history CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS password_reset_tokens CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS refresh_tokens CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS tenants CASCADE`);
  await db.execute(sql`DROP TYPE IF EXISTS user_role CASCADE`);
  await db.execute(sql`DROP TYPE IF EXISTS tenant_status CASCADE`);

  console.log('All tables dropped successfully!');
  await closeDbConnection();
}

resetDatabase().catch((err) => {
  console.error('Reset failed:', err);
  process.exit(1);
});
