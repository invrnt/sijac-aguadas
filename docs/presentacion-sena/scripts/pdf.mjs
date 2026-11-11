import puppeteer from "puppeteer-core";
const [,, html, out] = process.argv;
const b = await puppeteer.launch({ executablePath: "/usr/bin/chromium", args: ["--no-sandbox","--allow-file-access-from-files"] });
const p = await b.newPage();
await p.goto("file://" + html, { waitUntil: "networkidle0" });
await p.evaluateHandle("document.fonts.ready");
await p.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true });
await b.close();
