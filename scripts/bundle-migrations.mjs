// Empaqueta las migraciones SQL de drizzle/ en un módulo TypeScript para que
// el Worker pueda aplicarlas al arrancar (db/migrations/bundled.ts). Se usa
// el nombre de archivo, igual que `wrangler d1 migrations apply`, para que
// ambos caminos registren lo mismo en la tabla d1_migrations.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = "drizzle";
const out = "db/migrations/bundled.ts";

const migrations = readdirSync(dir)
  .filter((file) => file.endsWith(".sql"))
  .sort()
  .map((name) => ({
    name,
    statements: readFileSync(join(dir, name), "utf8")
      .split("--> statement-breakpoint")
      .map((statement) => statement.trim())
      .filter(Boolean),
  }));

const content = `// Archivo generado por scripts/bundle-migrations.mjs. No lo edite a mano:
// ejecute \`bun run db:generate\` o \`bun run build\`.
export const bundledMigrations: { name: string; statements: string[] }[] = ${JSON.stringify(migrations, null, 2)};
`;

let previous = "";
try {
  previous = readFileSync(out, "utf8");
} catch {}
if (previous !== content) {
  writeFileSync(out, content);
  console.info(`Migraciones empaquetadas: ${migrations.length} en ${out}`);
}
