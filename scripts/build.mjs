// Compilación única para local, GitHub Actions y Workers Builds.
//
// Workers Builds ejecuta `npm run build` y luego `npx wrangler deploy`, que
// delega en `opennextjs-cloudflare deploy` y necesita la salida .open-next/.
// Por eso, dentro de Workers Builds (WORKERS_CI=1) este script genera esa
// salida. OpenNext, a su vez, compila Next con `node scripts/build.mjs --next`
// (ver open-next.config.ts), lo que evita una recursión.
import { spawnSync } from "node:child_process";

function run(command) {
  const result = spawnSync(command, { stdio: "inherit", shell: true });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("node scripts/bundle-migrations.mjs");

const nextOnly = process.argv.includes("--next");
if (!nextOnly && process.env.WORKERS_CI === "1") {
  run("npx opennextjs-cloudflare build");
} else {
  run("npx next build");
}
