import type { ReactNode } from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "react-email";

export function EmailLayout({
  preview,
  eyebrow,
  title,
  children,
}: {
  preview: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={outer}>
          <Section style={brand}>
            <Text style={brandMark}>SA</Text>
            <Text style={brandName}>SIJAC AGUADAS</Text>
            <Text style={brandSubtitle}>
              Juntas de Acción Comunal
            </Text>
          </Section>
          <Section style={card}>
            <Text style={eyebrowStyle}>{eyebrow}</Text>
            <Heading as="h1" style={heading}>
              {title}
            </Heading>
            {children}
            <Hr style={divider} />
            <Text style={security}>
              Este mensaje fue generado por SIJAC Aguadas. Si no reconoce esta
              solicitud, ignore el correo y no comparta el enlace.
            </Text>
          </Section>
          <Text style={footer}>
            Sistema de Información de Juntas de Acción Comunal · Aguadas,
            Caldas
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const emailStyles = {
  paragraph: {
    color: "#33433c",
    fontSize: "16px",
    lineHeight: "26px",
    margin: "0 0 20px",
  },
  button: {
    backgroundColor: "#176b50",
    borderRadius: "10px",
    color: "#ffffff",
    display: "block",
    fontSize: "16px",
    fontWeight: "700",
    lineHeight: "20px",
    padding: "15px 20px",
    textAlign: "center" as const,
    textDecoration: "none",
  },
  action: {
    margin: "28px 0",
  },
  hint: {
    backgroundColor: "#f1f6f3",
    borderLeft: "4px solid #d3a53f",
    borderRadius: "8px",
    color: "#43544c",
    fontSize: "14px",
    lineHeight: "22px",
    margin: "22px 0 0",
    padding: "14px 16px",
  },
  fallback: {
    color: "#66756e",
    fontSize: "12px",
    lineHeight: "19px",
    margin: "20px 0 0",
    wordBreak: "break-all" as const,
  },
};

const body = {
  backgroundColor: "#edf3ef",
  color: "#1f3028",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
  margin: "0",
  padding: "0",
};

const outer = {
  margin: "0 auto",
  maxWidth: "600px",
  padding: "20px 12px 28px",
  width: "100%",
};

const brand = {
  padding: "8px 4px 20px",
  textAlign: "center" as const,
};

const brandMark = {
  backgroundColor: "#176b50",
  borderRadius: "12px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "18px",
  fontWeight: "800",
  lineHeight: "42px",
  margin: "0 0 10px",
  textAlign: "center" as const,
  width: "42px",
};

const brandName = {
  color: "#164d3c",
  fontSize: "17px",
  fontWeight: "800",
  letterSpacing: "1px",
  lineHeight: "22px",
  margin: "0",
};

const brandSubtitle = {
  color: "#66756e",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "2px 0 0",
};

const card = {
  backgroundColor: "#ffffff",
  border: "1px solid #dce7e0",
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(26, 71, 54, 0.08)",
  padding: "28px 22px",
};

const eyebrowStyle = {
  color: "#9a6e12",
  fontSize: "12px",
  fontWeight: "800",
  letterSpacing: "1px",
  lineHeight: "18px",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
};

const heading = {
  color: "#173d30",
  fontSize: "26px",
  fontWeight: "800",
  letterSpacing: "-0.5px",
  lineHeight: "32px",
  margin: "0 0 18px",
};

const divider = {
  borderColor: "#e2ebe5",
  margin: "28px 0 18px",
};

const security = {
  color: "#68766f",
  fontSize: "12px",
  lineHeight: "19px",
  margin: "0",
};

const footer = {
  color: "#65756d",
  fontSize: "11px",
  lineHeight: "18px",
  margin: "18px 8px 0",
  textAlign: "center" as const,
};
