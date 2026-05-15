import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

const queryClient = connectionString ? postgres(connectionString, { max: 1 }) : null;
const db = queryClient ? drizzle(queryClient, { schema }) : null;

export function getDb() {
  if (!db) {
    throw new Error("DATABASE_URL environment variable is not set. Add it to .env.local to enable all features.");
  }
  return db;
}

export { db };
export type DB = typeof db;