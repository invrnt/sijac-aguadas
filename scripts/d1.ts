import { getPlatformProxy } from "wrangler";
import { getDb } from "@/db";

// Fuera del Worker, wrangler expone el binding D1: la base local de
// `.wrangler/` por defecto, o la de producción con `--remote`
// (configuración en wrangler.remote.jsonc).
export async function openScriptDb() {
  const remote = process.argv.includes("--remote");
  const proxy = await getPlatformProxy<CloudflareEnv>(
    remote ? { configPath: "wrangler.remote.jsonc" } : {},
  );
  return { db: getDb(proxy.env.DB), dispose: proxy.dispose };
}
