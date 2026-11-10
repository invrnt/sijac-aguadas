import { env } from "@/lib/env";

// URL base de la aplicación para la solicitud actual. Se usa el encabezado
// Host porque Cloudflare solo entrega al Worker los dominios que le están
// asignados; X-Forwarded-Host no se usa porque lo controla el cliente.
export function appOrigin(requestHeaders: Headers) {
  if (env.BETTER_AUTH_URL) return env.BETTER_AUTH_URL;
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const local = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host);
  return `${local ? "http" : "https"}://${host}`;
}
