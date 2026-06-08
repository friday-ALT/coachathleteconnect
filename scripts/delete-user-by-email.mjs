#!/usr/bin/env node
/**
 * Delete a user (and related rows) by email — for resetting stuck test accounts.
 * Usage: DATABASE_URL=... node scripts/delete-user-by-email.mjs user@example.com
 */
import postgres from 'postgres';

const email = process.argv[2]?.toLowerCase().trim();
if (!email || !email.includes('@')) {
  console.error('Usage: node scripts/delete-user-by-email.mjs user@example.com');
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sql = postgres(url, { max: 1 });

try {
  const users = await sql`SELECT id, email FROM users WHERE email = ${email}`;
  if (users.length === 0) {
    console.log(`No user found for ${email}`);
    process.exit(0);
  }
  const userId = users[0].id;
  console.log(`Deleting user ${userId} (${email})...`);

  await sql`DELETE FROM messages WHERE sender_id = ${userId} OR recipient_id = ${userId}`;
  await sql`DELETE FROM reviews WHERE athlete_id = ${userId} OR coach_id = ${userId}`;
  await sql`DELETE FROM session_requests WHERE athlete_id = ${userId} OR coach_id = ${userId}`;
  await sql`DELETE FROM connections WHERE athlete_id = ${userId} OR coach_id = ${userId}`;
  await sql`DELETE FROM athlete_profiles WHERE user_id = ${userId}`;
  await sql`DELETE FROM coach_profiles WHERE user_id = ${userId}`;
  await sql`DELETE FROM users WHERE id = ${userId}`;

  console.log('Done.');
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await sql.end();
}
