import { Button, Section, Text } from "react-email";
import {
  EmailLayout,
  emailStyles,
} from "@/emails/components/EmailLayout";

export function PasswordResetEmail({
  userName = "Usuario SIJAC",
  resetUrl = "https://sijac.example.gov.co/nueva-contrasena",
}: {
  userName?: string;
  resetUrl?: string;
}) {
  return (
    <EmailLayout
      preview="Cree una nueva contraseña para recuperar su acceso a SIJAC Aguadas."
      eyebrow="Seguridad de la cuenta"
      title="Recupere su acceso"
    >
      <Text style={emailStyles.paragraph}>Hola, {userName}.</Text>
      <Text style={emailStyles.paragraph}>
        Recibimos una solicitud para cambiar la contraseña de su cuenta. Use el
        siguiente botón para crear una nueva.
      </Text>
      <Section style={emailStyles.action}>
        <Button href={resetUrl} style={emailStyles.button}>
          Crear nueva contraseña
        </Button>
      </Section>
      <Text style={emailStyles.hint}>
        El enlace es personal, vence en 60 minutos y solo puede utilizarse una
        vez.
      </Text>
      <Text style={emailStyles.fallback}>
        Si el botón no funciona, copie esta dirección en su navegador:
        {"\n"}
        {resetUrl}
      </Text>
    </EmailLayout>
  );
}

export default PasswordResetEmail;
