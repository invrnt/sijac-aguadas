import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, username } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { getDb, type Database } from "@/db";
import * as schema from "@/db/schema";
import { env } from "@/lib/env";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { appOrigin } from "@/lib/origin";
import { InvitationEmail } from "@/emails/InvitationEmail";
import { PasswordResetEmail } from "@/emails/PasswordResetEmail";
import { sendAccessEmail } from "@/lib/mail";

type AuthOptions = { baseURL?: string; secret?: string };

// D1 solo existe dentro de una solicitud, así que la instancia se crea al vuelo.
export function createAuth(
  db: Database = getDb(),
  { baseURL = env.BETTER_AUTH_URL, secret = env.BETTER_AUTH_SECRET }: AuthOptions = {},
) {
  return betterAuth({
    appName: "SIJAC Aguadas",
    baseURL,
    secret,
    database: drizzleAdapter(db, {
      provider: "sqlite",
      // D1 no admite transacciones interactivas.
      transaction: false,
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
        const callbackUrl = new URL(url).searchParams.get("callbackURL") ?? "";
        const isInvitation = callbackUrl.includes("invitation=1");
        await sendAccessEmail({
          to: user.email,
          subject: isInvitation
            ? "Active su cuenta de SIJAC Aguadas"
            : "Recuperación de acceso a SIJAC Aguadas",
          email: isInvitation ? (
            <InvitationEmail userName={user.name} invitationUrl={url} />
          ) : (
            <PasswordResetEmail userName={user.name} resetUrl={url} />
          ),
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
        ipAddressHeaders: ["cf-connecting-ip", "x-real-ip"],
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
}

// Instancia para una solicitud del Worker: toma la URL del dominio que recibió
// la solicitud y la clave de sesiones de los secretos o de D1.
export async function getAuth(requestHeaders: Headers) {
  const db = getDb();
  return createAuth(db, {
    baseURL: appOrigin(requestHeaders),
    secret: await resolveAuthSecret(db),
  });
}

export type Auth = ReturnType<typeof createAuth>;
export type AuthSession = Auth["$Infer"]["Session"];
