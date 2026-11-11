import { Button, Section, Text } from "react-email";
import {
  EmailLayout,
  emailStyles,
} from "@/emails/components/EmailLayout";

export function SetupCompleteEmail({
  userName = "Administrador",
  loginUrl = "https://sijac.org/iniciar-sesion",
}: {
  userName?: string;
  loginUrl?: string;
}) {
  return (
    <EmailLayout
      preview="La instalación de SIJAC Aguadas terminó y el envío de correos funciona."
      eyebrow="Configuración inicial"
      title="SIJAC Aguadas está listo"
    >
      <Text style={emailStyles.paragraph}>Hola, {userName}.</Text>
      <Text style={emailStyles.paragraph}>
        Su cuenta de administrador quedó creada. Si está leyendo este mensaje,
        el envío de correos también funciona: las invitaciones y la
        recuperación de contraseñas llegarán sin problema.
      </Text>
      <Section style={emailStyles.action}>
        <Button href={loginUrl} style={emailStyles.button}>
          Iniciar sesión
        </Button>
      </Section>
      <Text style={emailStyles.fallback}>
        Si el botón no funciona, copie esta dirección en su navegador:
        {"\n"}
        {loginUrl}
      </Text>
    </EmailLayout>
  );
}

export default SetupCompleteEmail;
