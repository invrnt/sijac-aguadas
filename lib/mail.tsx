import type { ReactElement } from "react";
import { render } from "react-email";
import { emailConfigured, env } from "@/lib/env";
import { logger } from "@/lib/logger";

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

  if (!emailConfigured) {
    if (env.NODE_ENV === "production") {
      logger.error("No se pudo enviar correo: RESEND_API_KEY ausente o inválida", {
        recipientDomain: to.split("@")[1],
      });
      throw new Error("EMAIL_NOT_CONFIGURED");
    }
    logger.info("Correo de desarrollo renderizado y omitido", {
      subject,
      recipientDomain: to.split("@")[1],
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
      recipientDomain: to.split("@")[1],
    });
    throw new Error("EMAIL_DELIVERY_FAILED");
  }
}
