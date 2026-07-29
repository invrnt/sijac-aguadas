import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env, hasDatabase } from "@/lib/env";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | undefined;
let database: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (!client) {
    const connectionString =
      env.DATABASE_URL ??
      "postgresql://postgres:postgres@127.0.0.1:5432/sijac";
    client = postgres(connectionString, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
      ssl: hasDatabase ? "require" : false,
    });
    database = drizzle(client, { schema });
  }

  return database!;
}

export type Database = ReturnType<typeof getDb>;
