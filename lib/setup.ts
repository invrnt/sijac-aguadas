import { eq, sql } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { env, SETUP_CODE_MIN_LENGTH, setupCodeConfigured } from "@/lib/env";
import { logger } from "@/lib/logger";
import { emailProvider, parseSender } from "@/lib/mail";

export const WORKER_NAME = "sijac-aguadas";
export const CLOUDFLARE_WORKERS_URL =
  "https://dash.cloudflare.com/?to=/:account/workers-and-pages";
export const CLOUDFLARE_PLANS_URL =
  "https://dash.cloudflare.com/?to=/:account/workers/plans";
export const CLOUDFLARE_DASHBOARD_URL = "https://dash.cloudflare.com/";
export const CLOUDFLARE_DOMAINS_URL = "https://domains.cloudflare.com/";

export type SetupLink = { label: string; href: string };

export type SetupCheck = {
  id: "database" | "storage" | "authSecret" | "setupCode" | "email";
  label: string;
  ok: boolean;
  // Si falta un requisito obligatorio, no se puede crear el administrador.
  required: boolean;
  detail: string;
  steps?: string[];
  links?: SetupLink[];
};

export async function hasAdmin() {
  const [row] = await getDb()
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, "admin"));
  return Number(row?.count ?? 0) > 0;
}

// Indica si la instalación ya terminó. Ante cualquier error (por ejemplo,
// tablas sin migrar) responde «no», para que el asistente muestre el problema.
export async function isInstalled() {
  try {
    return await hasAdmin();
  } catch {
    return false;
  }
}

const secretSteps = (name: string, value: string) => [
  "Abra el panel de Workers de Cloudflare con el botón de abajo.",
  `Entre al proyecto «${WORKER_NAME}» y vaya a Configuración (Settings) → Variables y secretos (Variables and Secrets).`,
  `Pulse «Agregar» (Add), elija el tipo «Secreto» (Secret), escriba el nombre ${name} y como valor ${value}.`,
  "Pulse «Implementar» (Deploy) y luego recargue esta página.",
];

export async function getSetupChecks(): Promise<SetupCheck[]> {
  const checks: SetupCheck[] = [];

  let databaseReady = false;
  try {
    await getDb().select({ id: users.id }).from(users).limit(1);
    databaseReady = true;
  } catch (error) {
    logger.warn("Asistente: base de datos no disponible", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
  checks.push({
    id: "database",
    label: "Base de datos",
    ok: databaseReady,
    required: true,
    detail: databaseReady
      ? "La base de datos D1 está conectada y tiene sus tablas."
      : "La base de datos no responde o todavía no tiene tablas. Las tablas se crean durante el despliegue.",
    steps: databaseReady
      ? undefined
      : [
          "Abra el panel de Workers de Cloudflare.",
          `Entre al proyecto «${WORKER_NAME}» y abra la pestaña «Implementaciones» (Deployments).`,
          "Si el último despliegue falló, ábralo, revise el registro y pulse «Reintentar compilación» (Retry build).",
          "Cuando termine en verde, recargue esta página.",
        ],
    links: databaseReady
      ? undefined
      : [{ label: "Abrir Workers en Cloudflare", href: CLOUDFLARE_WORKERS_URL }],
  });

  let storageReady = false;
  try {
    await getCloudflareContext().env.FILES.head("__sijac-setup-check");
    storageReady = true;
  } catch (error) {
    logger.warn("Asistente: almacenamiento R2 no disponible", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
  checks.push({
    id: "storage",
    label: "Almacenamiento de documentos",
    ok: storageReady,
    required: true,
    detail: storageReady
      ? "El bucket privado R2 para documentos está conectado."
      : "El bucket R2 no está conectado. Vuelva a desplegar el proyecto desde Cloudflare.",
    links: storageReady
      ? undefined
      : [{ label: "Abrir Workers en Cloudflare", href: CLOUDFLARE_WORKERS_URL }],
  });

  let secretReady = false;
  if (databaseReady) {
    try {
      await resolveAuthSecret(getDb());
      secretReady = true;
    } catch {
      secretReady = false;
    }
  }
  checks.push({
    id: "authSecret",
    label: "Clave de sesiones",
    ok: secretReady,
    required: true,
    detail: secretReady
      ? env.BETTER_AUTH_SECRET
        ? "Se usa la clave BETTER_AUTH_SECRET registrada en Cloudflare."
        : "Se generó automáticamente y quedó guardada en la base de datos."
      : "Se generará en cuanto la base de datos esté lista.",
  });

  checks.push({
    id: "setupCode",
    label: "Clave de instalación",
    ok: setupCodeConfigured,
    required: true,
    detail: setupCodeConfigured
      ? "La clave que eligió al desplegar está registrada. La pediremos en el siguiente paso."
      : `Falta el secreto SETUP_CODE, o tiene menos de ${SETUP_CODE_MIN_LENGTH} caracteres. Protege este asistente para que nadie más cree el administrador.`,
    steps: setupCodeConfigured
      ? undefined
      : secretSteps(
          "SETUP_CODE",
          `una clave que usted invente, de al menos ${SETUP_CODE_MIN_LENGTH} caracteres`,
        ),
    links: setupCodeConfigured
      ? undefined
      : [{ label: "Abrir Workers en Cloudflare", href: CLOUDFLARE_WORKERS_URL }],
  });

  // No hay forma de saber si el dominio ya está dado de alta sin enviar un
  // correo: la prueba real ocurre al crear el administrador (paso 2).
  const provider = emailProvider();
  const senderDomain = parseSender(env.EMAIL_FROM).email.split("@")[1] ?? "";
  checks.push({
    id: "email",
    label: "Envío de correos",
    ok: provider !== "none",
    required: false,
    detail:
      provider === "cloudflare"
        ? `Conectado a Cloudflare Email Sending. Los correos saldrán desde ${env.EMAIL_FROM}. Al crear el administrador le enviaremos un correo de prueba.`
        : provider === "resend"
          ? `Conectado a Resend. Los correos saldrán desde ${env.EMAIL_FROM}.`
          : "Sin canal de correo. Puede seguir: el sistema funciona, pero no enviará invitaciones ni recuperaciones de contraseña.",
    steps:
      provider === "resend"
        ? undefined
        : [
            "Active el plan Workers Paid (USD 5 al mes) en Cloudflare: Workers y Pages → Planes.",
            `Si aún no tiene el dominio ${senderDomain}, cómprelo en Cloudflare Registrar con la misma cuenta.`,
            `En el panel de Cloudflare abra Email Service → Email Sending, pulse «Onboard Domain», elija ${senderDomain} y pulse «Add records and onboard». Cloudflare crea solo los registros DNS.`,
            "Espere entre 5 y 15 minutos a que el dominio quede verificado.",
            `Si usará otro dominio, cambie la variable EMAIL_FROM en el proyecto «${WORKER_NAME}» → Configuración (Settings) → Variables y secretos.`,
          ],
    links:
      provider === "resend"
        ? undefined
        : [
            { label: "Activar Workers Paid", href: CLOUDFLARE_PLANS_URL },
            { label: "Comprar el dominio", href: CLOUDFLARE_DOMAINS_URL },
            { label: "Abrir el panel de Cloudflare", href: CLOUDFLARE_DASHBOARD_URL },
          ],
  });

  return checks;
}
