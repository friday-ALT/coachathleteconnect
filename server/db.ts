import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Get your connection string from Supabase dashboard > Settings > Database",
  );
}

const client = postgres(process.env.DATABASE_URL, {
  max: 10,           // pool size — was 1, which serialised every request
  idle_timeout: 30,  // close idle connections after 30s
  connect_timeout: 10,
  prepare: false,    // required when using Supabase PgBouncer
});

export const db = drizzle(client, { schema });
