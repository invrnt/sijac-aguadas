import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  // Opcionales: sin ellas, la URL se toma del dominio de cada solicitud, así
  // el mismo código funciona en *.workers.dev y en un dominio propio.
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  // Opcional: sin él, se genera uno y se guarda en D1 (lib/auth-secret.ts).
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  // Clave que pide el asistente de configuración inicial para crear la
  // primera cuenta de administrador.
  SETUP_CODE: z.string().optional(),
  DEMO_MODE: z.enum(["true", "false"]).default("false"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("SIJAC Aguadas <no-reply@example.gov.co>"),
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.string().default("info"),
});

export const env = schema.parse(process.env);

export const demoEnabled =
  env.NODE_ENV !== "production" && env.DEMO_MODE === "true";
// D1 siempre está enlazada al Worker; el modo demostración la sustituye por
// datos ficticios.
export const hasDatabase = !demoEnabled;

// Las claves de Resend empiezan por «re_». El formulario de despliegue exige
// un valor, así que «pendiente» u otro texto cuenta como no configurado.
export const emailConfigured = Boolean(env.RESEND_API_KEY?.startsWith("re_"));
export const emailSenderConfigured = !env.EMAIL_FROM.includes("example.gov.co");

export const SETUP_CODE_MIN_LENGTH = 8;
export const setupCodeConfigured =
  (env.SETUP_CODE?.trim().length ?? 0) >= SETUP_CODE_MIN_LENGTH;
