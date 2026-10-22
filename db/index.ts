import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import type { D1Database } from "@cloudflare/workers-types";
import * as schema from "./schema";

// La conexión D1 llega como binding del Worker en cada solicitud. Los scripts
// fuera de Workers (semilla, importación) pasan su propio binding.
export function getDb(binding?: D1Database) {
  return drizzle(binding ?? getCloudflareContext().env.DB, { schema });
}

export type Database = ReturnType<typeof getDb>;
