// Bindings propios declarados en wrangler.jsonc. @opennextjs/cloudflare ya
// declara los suyos (ASSETS, WORKER_SELF_REFERENCE) en la misma interfaz.
import type { D1Database, R2Bucket, SendEmail } from "@cloudflare/workers-types";

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    FILES: R2Bucket;
    // Cloudflare Email Sending. Opcional para que el código funcione aunque
    // el binding se quite de wrangler.jsonc.
    EMAIL?: SendEmail;
  }
}

export {};
