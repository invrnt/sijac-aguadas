import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL es obligatoria para ejecutar migraciones.");
}

const client = postgres(connectionString, {
  connect_timeout: 15,
  max: 1,
  prepare: false,
  ssl: "require",
});

try {
  await migrate(drizzle(client), {
    migrationsFolder: "drizzle",
  });
  console.info("Migraciones de SIJAC aplicadas correctamente.");
} finally {
  await client.end({ timeout: 5 });
}
