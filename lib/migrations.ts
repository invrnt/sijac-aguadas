import type { D1Database } from "@cloudflare/workers-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { bundledMigrations } from "@/db/migrations/bundled";
import { logger } from "@/lib/logger";

// Misma tabla y formato que `wrangler d1 migrations apply`, así una base
// migrada con wrangler no repite nada y viceversa.
const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS d1_migrations(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
)`;

let ready: Promise<void> | undefined;

async function appliedNames(db: D1Database) {
  const { results } = await db
    .prepare("SELECT name FROM d1_migrations")
    .all<{ name: string }>();
  return new Set(results.map((row) => row.name));
}

async function applyPending(db: D1Database) {
  await db.prepare(CREATE_TABLE).run();
  let applied = await appliedNames(db);

  for (const migration of bundledMigrations) {
    if (applied.has(migration.name)) continue;
    try {
      // Un batch de D1 es una transacción: la migración y su registro se
      // aplican juntos o no se aplica nada.
      await db.batch([
        ...migration.statements.map((statement) => db.prepare(statement)),
        db.prepare("INSERT INTO d1_migrations (name) VALUES (?)").bind(migration.name),
      ]);
      logger.info("Migración aplicada", { migration: migration.name });
    } catch (error) {
      // Otra instancia pudo aplicarla al mismo tiempo: se comprueba antes de
      // dar el error por bueno.
      applied = await appliedNames(db);
      if (applied.has(migration.name)) continue;
      logger.error("No se pudo aplicar la migración", {
        migration: migration.name,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

// Aplica las migraciones pendientes una vez por instancia del Worker. Así las
// tablas existen sin depender de que el despliegue tenga permisos sobre D1.
export function ensureMigrations(
  db: D1Database = getCloudflareContext().env.DB,
) {
  ready ??= applyPending(db).catch((error) => {
    ready = undefined;
    throw error;
  });
  return ready;
}
