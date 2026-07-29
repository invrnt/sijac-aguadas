import { describe, expect, test } from "bun:test";
import { render } from "react-email";
import { InvitationEmail } from "@/emails/InvitationEmail";
import { PasswordResetEmail } from "@/emails/PasswordResetEmail";

describe("correos transaccionales React Email", () => {
  test("renderiza recuperación accesible con URL de respaldo", async () => {
    const url = "https://sijac.example/reset?token=seguro";
    const html = await render(
      <PasswordResetEmail userName="María" resetUrl={url} />,
    );
    const text = await render(
      <PasswordResetEmail userName="María" resetUrl={url} />,
      { plainText: true },
    );

    expect(html).toContain("Crear nueva contraseña");
    expect(html).toContain("max-width:600px");
    expect(text).toContain("María");
    expect(text).toContain(url);
  });

  test("renderiza invitación con llamada a la acción mobile first", async () => {
    const html = await render(
      <InvitationEmail
        userName="Carlos"
        invitationUrl="https://sijac.example/invitacion"
      />,
    );

    expect(html).toContain("Bienvenido a SIJAC Aguadas");
    expect(html).toContain("Activar mi cuenta");
    expect(html).toContain("width:100%");
  });
});
