import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SIJAC Aguadas",
    short_name: "SIJAC",
    description:
      "Sistema de Información de Juntas de Acción Comunal de Aguadas",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f4ee",
    theme_color: "#173f35",
    lang: "es-CO",
    orientation: "any",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicon.png",
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
