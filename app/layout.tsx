import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import { appOrigin } from "@/lib/origin";
import "./globals.css";

// Sin NEXT_PUBLIC_APP_URL fija, las URL absolutas (Open Graph) usan el dominio
// de la solicitud, para que una instalación nueva funcione sin configurarla.
export async function generateMetadata(): Promise<Metadata> {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? appOrigin(await headers());
  return { ...metadata, metadataBase: new URL(appUrl) };
}

const metadata: Metadata = {
  title: {
    default: "SIJAC Aguadas",
    template: "%s · SIJAC Aguadas",
  },
  description:
    "Sistema de Información de Juntas de Acción Comunal de Aguadas, Caldas.",
  applicationName: "SIJAC Aguadas",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "SIJAC Aguadas",
    description: "Sistema de Información de Juntas de Acción Comunal",
    type: "website",
    locale: "es_CO",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "SIJAC Aguadas sobre un paisaje ilustrado del municipio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SIJAC Aguadas",
    description: "Sistema de Información de Juntas de Acción Comunal",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#173f35",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <a className="skip-link" href="#contenido-principal">
          Saltar al contenido
        </a>
        {children}
        <Script id="register-sw" strategy="afterInteractive">
          {`if ("serviceWorker" in navigator) { window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {})); }`}
        </Script>
      </body>
    </html>
  );
}
