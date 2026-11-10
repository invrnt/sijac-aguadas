import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { auditLogs, rateLimits } from "@/db/schema";
import { getAuth } from "@/lib/auth";
import { demoEnabled, env, setupCodeConfigured } from "@/lib/env";
import { logger } from "@/lib/logger";
import { hasAdmin } from "@/lib/setup";

const payloadSchema = z.object({
  setupCode: z.string().min(1).max(200),
  name: z.string().trim().min(3).max(120),
  email: z.string().trim().toLowerCase().email().max(180),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9._-]+$/),
  password: z.string().min(10).max(128),
});

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

async function digest(value: string) {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
}

// Compara resúmenes de longitud fija para no filtrar información por tiempo.
async function codesMatch(received: string, expected: string) {
  const [a, b] = await Promise.all([digest(received), digest(expected)]);
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a[index] ^ b[index];
  return diff === 0;
}

// Cuenta los intentos fallidos por IP en la misma tabla de límites de Better
// Auth, con un prefijo propio para no chocar con sus claves.
async function failureState(key: string) {
  const [row] = await getDb()
    .select()
    .from(rateLimits)
    .where(eq(rateLimits.key, key))
    .limit(1);
  if (!row || Date.now() - row.lastRequest > WINDOW_MS) return { row, count: 0 };
  return { row, count: row.count };
}

async function recordFailure(key: string, current: number) {
  const now = Date.now();
  await getDb()
    .insert(rateLimits)
    .values({ id: crypto.randomUUID(), key, count: 1, lastRequest: now })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: { count: current + 1, lastRequest: now },
    });
}

export async function POST(request: Request) {
  if (demoEnabled) {
    return NextResponse.json(
      { error: "El asistente no está disponible en modo demostración." },
      { status: 400 },
    );
  }
  if (!setupCodeConfigured || !env.SETUP_CODE) {
    return NextResponse.json(
      { error: "Primero registre el secreto SETUP_CODE en Cloudflare." },
      { status: 503 },
    );
  }

  const payload = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) {
    return NextResponse.json(
      {
        error:
          "Revise los datos: nombre de al menos 3 letras, correo válido, usuario con letras minúsculas, números, punto o guion, y contraseña de al menos 10 caracteres.",
      },
      { status: 422 },
    );
  }

  if (await hasAdmin()) {
    return NextResponse.json(
      { error: "La instalación ya tiene un administrador. Inicie sesión." },
      { status: 409 },
    );
  }

  const ip = request.headers.get("cf-connecting-ip") ?? "local";
  const limitKey = `setup-code:${ip}`;
  const failures = await failureState(limitKey);
  if (failures.count >= MAX_FAILURES) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espere 15 minutos y vuelva a intentarlo." },
      { status: 429 },
    );
  }
  if (!(await codesMatch(payload.data.setupCode.trim(), env.SETUP_CODE.trim()))) {
    await recordFailure(limitKey, failures.count);
    logger.warn("Asistente: clave de instalación incorrecta", { ip });
    return NextResponse.json(
      {
        error: `La clave de instalación no coincide. Le quedan ${MAX_FAILURES - failures.count - 1} intentos.`,
      },
      { status: 403 },
    );
  }

  const { setupCode: _setupCode, ...account } = payload.data;
  void _setupCode;
  try {
    const auth = await getAuth(request.headers);
    const created = await auth.api.createUser({
      body: {
        email: account.email,
        password: account.password,
        name: account.name,
        role: "admin",
        data: { username: account.username, displayUsername: account.username },
      },
    });
    await getDb().insert(auditLogs).values({
      actorId: created.user.id,
      actorEmail: created.user.email,
      action: "create",
      entityType: "user",
      entityId: created.user.id,
      newValues: { role: "admin", origin: "configuracion-inicial" },
      ipAddress: ip,
    });
    logger.info("Asistente: administrador inicial creado", {
      userId: created.user.id,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    logger.error("Asistente: no se pudo crear el administrador", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        error:
          "No fue posible crear la cuenta. Verifique que el correo y el usuario no estén repetidos e intente de nuevo.",
      },
      { status: 500 },
    );
  }
}
