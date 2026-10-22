import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
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

export function assertProductionEnv() {
  if (env.NODE_ENV !== "production") return;

  const missing = [
    !env.BETTER_AUTH_SECRET && "BETTER_AUTH_SECRET",
  ].filter(Boolean);

  if (missing.length) {
    throw new Error(
      `Faltan variables obligatorias de producción: ${missing.join(", ")}`,
    );
  }
}
