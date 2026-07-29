import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  DATABASE_URL: z.string().url().optional(),
  DEMO_MODE: z.enum(["true", "false"]).default("false"),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
  SUPABASE_STORAGE_BUCKET: z.string().default("sijac-private"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("SIJAC Aguadas <no-reply@example.gov.co>"),
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.string().default("info"),
});

export const env = schema.parse(process.env);

export const hasDatabase = Boolean(env.DATABASE_URL);
export const demoEnabled =
  env.NODE_ENV !== "production" && env.DEMO_MODE === "true";

export function assertProductionEnv() {
  if (env.NODE_ENV !== "production") return;

  const missing = [
    !env.DATABASE_URL && "DATABASE_URL",
    !env.BETTER_AUTH_SECRET && "BETTER_AUTH_SECRET",
    !env.SUPABASE_URL && "SUPABASE_URL",
    !env.SUPABASE_SERVICE_ROLE_KEY && "SUPABASE_SERVICE_ROLE_KEY",
  ].filter(Boolean);

  if (missing.length) {
    throw new Error(
      `Faltan variables obligatorias de producción: ${missing.join(", ")}`,
    );
  }
}
