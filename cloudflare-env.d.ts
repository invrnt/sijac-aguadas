// Bindings propios declarados en wrangler.jsonc. @opennextjs/cloudflare ya
// declara los suyos (ASSETS, WORKER_SELF_REFERENCE) en la misma interfaz.
import type { D1Database, R2Bucket } from "@cloudflare/workers-types";

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    FILES: R2Bucket;
  }
}

export {};
