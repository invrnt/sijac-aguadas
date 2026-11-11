import puppeteer from "puppeteer-core";
const out = process.argv[2];
const b = await puppeteer.launch({ executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] });
const p = await b.newPage();
const base = "http://localhost:3457";
const go = async (u)=>{ await p.goto(base+u,{waitUntil:"networkidle0",timeout:90000}); await new Promise(r=>setTimeout(r,800)); };
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await go("/"); await p.screenshot({ path: `${out}/home.png` });
await p.setCookie({ name: "sijac-demo-role", value: "admin", domain: "localhost", path: "/" });
for (const r of ["panel","juntas","compromisos","actividades","reportes","manual","administracion/usuarios","administracion/auditoria"]) { await go("/"+r); await p.screenshot({ path: `${out}/${r.replace("/","-")}.png` }); }
for (const [l,n,ex] of [["/juntas","junta-detalle","/juntas/nueva"],["/reuniones","reunion-detalle",""],["/actas","acta-detalle",""]]) {
  await go(l); const h = await p.$$eval(`a[href^='${l}/']`, (as,ex)=>as.map(a=>a.getAttribute("href")).find(x=>x!==ex), ex);
  if (h) { await go(h); await p.screenshot({ path: `${out}/${n}.png` }); }
}
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
for (const r of ["panel","juntas"]) { await go("/"+r); await p.screenshot({ path: `${out}/m-${r}.png` }); }
await b.close();
