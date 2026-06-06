import { sql } from 'drizzle-orm';
import { db } from './db';

/** Safe idempotent patches for production DBs that predate newer columns. */
export async function ensureDbSchema(): Promise<void> {
  const patches = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_role varchar`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id varchar`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version integer DEFAULT 0`,
    `ALTER TABLE coach_profiles ADD COLUMN IF NOT EXISTS stripe_account_id varchar`,
    `ALTER TABLE coach_profiles ADD COLUMN IF NOT EXISTS stripe_onboarding_complete integer DEFAULT 0`,
  ];

  for (const statement of patches) {
    await db.execute(sql.raw(statement));
  }
}
