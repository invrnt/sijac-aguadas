import type { ReactElement } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { render } from "react-email";
import { env, resendConfigured } from "@/lib/env";
import { logger } from "@/lib/logger";

export type EmailProvider = "cloudflare" | "resend" | "none";

// Convierte «Nombre <correo@dominio>» en { name, email }.
export function parseSender(value: string): { email: string; name?: string } {
  const match = value.match(/^\s*(.*?)\s*<\s*([^>]+?)\s*>\s*$/);
  if (!match) return { email: value.trim() };
  const name = match[1].replace(/^"|"$/g, "").trim();
  return name ? { name, email: match[2] } : { email: match[2] };
}

function senderAddress() {
  const { email, name } = parseSender(env.EMAIL_FROM);
  return name ? { email, name } : email;
}

function emailBinding() {
  try {
    return getCloudflareContext().env.EMAIL;
  } catch {
    return undefined;
  }
}

// Cloudflare Email Sending es el canal principal: no necesita claves, solo el
// binding EMAIL y el dominio del remitente dado de alta en Email Service.
export function emailProvider(): EmailProvider {
  if (emailBinding()) return "cloudflare";
  if (resendConfigured) return "resend";
  return "none";
}

export class EmailError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "EmailError";
  }
}

export async function sendAccessEmail({
  to,
  subject,
  email,
}: {
  to: string;
  subject: string;
  email: ReactElement;
}) {
  const [html, text] = await Promise.all([
    render(email),
    render(email, { plainText: true }),
  ]);
  const recipientDomain = to.split("@")[1];
  const binding = emailBinding();

  if (binding) {
    try {
      const result = await binding.send({
        from: senderAddress(),
        to,
        subject,
        html,
        text,
      });
      logger.info("Correo enviado con Cloudflare", {
        messageId: result.messageId,
        recipientDomain,
      });
      return;
    } catch (error) {
      const code =
        (error as { code?: string } | null)?.code ?? "E_UNKNOWN";
      logger.error("Fallo de Cloudflare Email Sending", {
        code,
        error: error instanceof Error ? error.message : String(error),
        recipientDomain,
      });
      throw new EmailError(code, "EMAIL_DELIVERY_FAILED");
    }
  }

  if (!resendConfigured) {
    if (env.NODE_ENV === "production") {
      logger.error("No se pudo enviar correo: no hay canal configurado", {
        recipientDomain,
      });
      throw new EmailError("EMAIL_NOT_CONFIGURED", "EMAIL_NOT_CONFIGURED");
    }
    logger.info("Correo de desarrollo renderizado y omitido", {
      subject,
      recipientDomain,
    });
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    logger.error("Fallo del proveedor de correo", {
      status: response.status,
      recipientDomain,
    });
    throw new EmailError(`RESEND_${response.status}`, "EMAIL_DELIVERY_FAILED");
  }
}
