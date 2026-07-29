import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, username } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { env } from "@/lib/env";
import { sendAccessEmail } from "@/lib/mail";

export const auth = betterAuth({
  appName: "SIJAC Aguadas",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(getDb(), {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
      rateLimit: schema.rateLimits,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendAccessEmail({
        to: user.email,
        subject: "Recuperación de acceso a SIJAC Aguadas",
        html: `<p>Recibimos una solicitud para restablecer su acceso.</p><p><a href="${url}">Crear una nueva contraseña</a></p><p>El enlace es temporal y solo puede usarse una vez.</p>`,
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 8,
    updateAge: 60 * 30,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    modelName: "rateLimit",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-in/username": { window: 60, max: 5 },
      "/request-password-reset": { window: 300, max: 3 },
    },
  },
  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
    ipAddress: {
      ipAddressHeaders: ["x-real-ip"],
    },
  },
  disabledPaths: ["/is-username-available", "/sign-up/email"],
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 40,
    }),
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    nextCookies(),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
