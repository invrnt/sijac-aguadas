import { defineConfig } from "drizzle-kit";

// Solo genera SQL; wrangler aplica las migraciones a D1
// (`bun run db:migrate:local` o `bun run db:migrate:remote`).
export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "sqlite",
  strict: true,
  verbose: true,
});
