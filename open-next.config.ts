import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = {
  ...defineCloudflareConfig(),
  // El script `build` de package.json genera la salida de OpenNext dentro de
  // Workers Builds; aquí se pide solo la compilación de Next para no entrar
  // en un ciclo (ver scripts/build.mjs).
  buildCommand: "node scripts/build.mjs --next",
};

export default config;
