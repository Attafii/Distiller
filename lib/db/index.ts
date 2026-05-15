import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

const queryClient = connectionString ? postgres(connectionString, { max: 1 }) : null;
const db = queryClient ? drizzle(queryClient, { schema }) : null;

export { db };
export type DB = typeof db;