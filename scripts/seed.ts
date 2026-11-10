import { eq } from "drizzle-orm";
import { createAuth } from "@/lib/auth";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { juntas, users } from "@/db/schema";
import { openScriptDb } from "./d1";

const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@sijac.local";
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Cambiar-Antes-De-Produccion-2026!";
const consultaEmail = process.env.SEED_CONSULTA_EMAIL ?? "consulta@sijac.local";
const consultaPassword =
  process.env.SEED_CONSULTA_PASSWORD ?? "Cambiar-Antes-De-Produccion-2026!";

const targetsProduction =
  process.env.NODE_ENV === "production" || process.argv.includes("--remote");

if (targetsProduction && !process.env.SEED_ADMIN_PASSWORD) {
  throw new Error(
    "En producción debe definir SEED_ADMIN_PASSWORD explícitamente.",
  );
}

const { db, dispose } = await openScriptDb();
const auth = createAuth(db, { secret: await resolveAuthSecret(db) });

async function ensureUser({
  email,
  password,
  name,
  role,
  username,
}: {
  email: string;
  password: string;
  name: string;
  role: "admin" | "user";
  username: string;
}) {
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) return existing;
  const created = await auth.api.createUser({
    body: {
      email,
      password,
      name,
      role,
      data: { username, displayUsername: username },
    },
  });
  return created.user;
}

const places = [
  "Centro",
  "Pore",
  "Arma",
  "Encimadas",
  "La Mermita",
  "San Nicolás",
  "Viboral",
  "El Edén",
  "La Zulia",
  "Pito",
  "Alto de la Montaña",
  "Guaimaral",
  "La Chorrera",
  "El Diamante",
  "San José",
  "Los Chorros",
  "La Habana",
];

async function main() {
  const adminUser = await ensureUser({
    email: adminEmail,
    password: adminPassword,
    name: "Administrador SIJAC",
    role: "admin",
    username: "administrador",
  });
  await ensureUser({
    email: consultaEmail,
    password: consultaPassword,
    name: "Usuario de Consulta SIJAC",
    role: "user",
    username: "consulta",
  });

  const existingJuntas = await db.select({ id: juntas.id }).from(juntas).limit(1);
  if (!existingJuntas.length) {
    // D1 limita cada consulta a 100 parámetros: una inserción por ficha.
    const rows = Array.from({ length: 68 }, (_, index) => {
      const number = index + 1;
      const place = places[index % places.length];
      return {
        code: `DEV-${String(number).padStart(3, "0")}`,
        officialName: `FICHA DEMOSTRATIVA ${String(number).padStart(2, "0")} - ${place}`,
        neighborhood: place,
        sourceNeighborhood: place,
        zone: index % 4 === 0 ? ("urbana" as const) : ("rural" as const),
        affiliatesCount: 0,
        status: "activa" as const,
        pendingFields: [
          "nit",
          "legalEntityNumber",
          "resolutionNumber",
          "contact",
        ],
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
      };
    });
    const [first, ...rest] = rows.map((row) => db.insert(juntas).values(row));
    await db.batch([first, ...rest]);
  }
  console.info(
    "Semilla aplicada: dos cuentas de desarrollo y 68 fichas ficticias.",
  );
}

try {
  await main();
} finally {
  await dispose();
}
