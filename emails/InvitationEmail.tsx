import { Button, Section, Text } from "react-email";
import {
  EmailLayout,
  emailStyles,
} from "@/emails/components/EmailLayout";

export function InvitationEmail({
  userName = "Nuevo usuario",
  invitationUrl = "https://sijac.example.gov.co/nueva-contrasena",
}: {
  userName?: string;
  invitationUrl?: string;
}) {
  return (
    <EmailLayout
      preview="Su cuenta de SIJAC Aguadas está lista. Active el acceso de forma segura."
      eyebrow="Invitación institucional"
      title="Bienvenido a SIJAC Aguadas"
    >
      <Text style={emailStyles.paragraph}>Hola, {userName}.</Text>
      <Text style={emailStyles.paragraph}>
        Se creó una cuenta para usted en el Sistema de Información de Juntas de
        Acción Comunal. Para comenzar, establezca una contraseña personal.
      </Text>
      <Section style={emailStyles.action}>
        <Button href={invitationUrl} style={emailStyles.button}>
          Activar mi cuenta
        </Button>
      </Section>
      <Text style={emailStyles.hint}>
        Por seguridad, este enlace vence en 60 minutos. Nunca le solicitaremos
        su contraseña por correo electrónico.
      </Text>
      <Text style={emailStyles.fallback}>
        Si el botón no funciona, copie esta dirección en su navegador:
        {"\n"}
        {invitationUrl}
      </Text>
    </EmailLayout>
  );
}

export default InvitationEmail;
