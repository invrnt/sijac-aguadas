import { eq } from "drizzle-orm";
import type { Database } from "@/db";
import { systemSettings } from "@/db/schema";
import { env } from "@/lib/env";

const AUTH_SECRET_KEY = "internal.authSecret";
let cachedSecret: string | undefined;

function randomSecret() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// Si no se registró BETTER_AUTH_SECRET, la primera solicitud genera uno y lo
// guarda en D1. Así quien instala desde el botón de Cloudflare no tiene que
// inventar una clave aleatoria. La inserción ignora conflictos y luego relee
// el valor, de modo que dos solicitudes simultáneas terminan con el mismo.
export async function resolveAuthSecret(db: Database) {
  if (env.BETTER_AUTH_SECRET) return env.BETTER_AUTH_SECRET;
  if (cachedSecret) return cachedSecret;

  const read = async () => {
    const [row] = await db
      .select({ value: systemSettings.value })
      .from(systemSettings)
      .where(eq(systemSettings.key, AUTH_SECRET_KEY))
      .limit(1);
    return typeof row?.value === "string" ? row.value : undefined;
  };

  let secret = await read();
  if (!secret) {
    await db
      .insert(systemSettings)
      .values({
        key: AUTH_SECRET_KEY,
        value: randomSecret(),
        description: "Clave interna de firma de sesiones. No la comparta.",
      })
      .onConflictDoNothing();
    secret = await read();
  }
  if (!secret) throw new Error("No se pudo obtener la clave de sesiones.");
  cachedSecret = secret;
  return secret;
}
