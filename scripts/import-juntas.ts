import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { eq, or } from "drizzle-orm";
import { auditLogs, juntas } from "@/db/schema";
import { openScriptDb } from "./d1";

type Row = Record<string, string>;

function parseCsv(source: string): Row[] {
  const lines = source.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const parseLine = (line: string) => {
    const values: string[] = [];
    let value = "";
    let quoted = false;
    for (let index = 0; index < line.length; index++) {
      const char = line[index];
      if (char === '"') {
        if (quoted && line[index + 1] === '"') {
          value += '"';
          index++;
        } else quoted = !quoted;
      } else if (char === "," && !quoted) {
        values.push(value.trim());
        value = "";
      } else value += char;
    }
    values.push(value.trim());
    return values;
  };
  const headers = parseLine(lines[0]).map((item) => item.toLowerCase());
  return lines.slice(1).map((line) =>
    Object.fromEntries(
      parseLine(line).map((value, index) => [headers[index], value]),
    ),
  );
}

const fileArgument = process.argv[2];
if (!fileArgument) {
  throw new Error(
    "Uso: bun run import:juntas -- ruta/al/archivo.csv [--confirm] [--remote]",
  );
}

const confirmed = process.argv.includes("--confirm");
const rows = parseCsv(await readFile(resolve(fileArgument), "utf8"));
const required = ["codigo", "nombre", "vereda_barrio", "zona"];
const errors: string[] = [];
const seenCodes = new Set<string>();

for (const [index, row] of rows.entries()) {
  for (const field of required) {
    if (!row[field]) errors.push(`Fila ${index + 2}: falta ${field}`);
  }
  const code = row.codigo?.toLocaleLowerCase("es");
  if (code && seenCodes.has(code))
    errors.push(`Fila ${index + 2}: código duplicado ${row.codigo}`);
  if (code) seenCodes.add(code);
  if (row.zona && !["urbana", "rural"].includes(row.zona.toLowerCase()))
    errors.push(`Fila ${index + 2}: zona inválida ${row.zona}`);
  if (row.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.correo))
    errors.push(`Fila ${index + 2}: correo inválido`);
}

const report = {
  file: resolve(fileArgument),
  totalRows: rows.length,
  errors,
  readyToImport: rows.length - new Set(
    errors
      .map((error) => Number(error.match(/Fila (\d+)/)?.[1]))
      .filter(Boolean),
  ).size,
  confirmed,
};

console.info(JSON.stringify(report, null, 2));
if (errors.length || !confirmed) {
  if (!confirmed)
    console.info(
      "Previsualización terminada. Corrija errores y agregue --confirm para importar.",
    );
  process.exit(errors.length ? 1 : 0);
}

const { db, dispose } = await openScriptDb();
try {
  for (const row of rows) {
    const [duplicate] = await db
      .select({ id: juntas.id })
      .from(juntas)
      .where(
        or(
          eq(juntas.code, row.codigo),
          ...(row.nit ? [eq(juntas.nit, row.nit)] : []),
          ...(row.personeria
            ? [eq(juntas.legalEntityNumber, row.personeria)]
            : []),
        ),
      )
      .limit(1);
    if (duplicate) continue;
    const id = crypto.randomUUID();
    await db.batch([
      db.insert(juntas).values({
        id,
        code: row.codigo,
        officialName: row.nombre,
        neighborhood: row.vereda_barrio,
        sourceNeighborhood: row.vereda_barrio_original || row.vereda_barrio,
        zone: row.zona.toLowerCase() as "urbana" | "rural",
        affiliatesCount: Number(row.afiliados || 0),
        nit: row.nit || null,
        legalEntityNumber: row.personeria || null,
        resolutionNumber: row.resolucion || null,
        address: row.direccion || null,
        phone: row.telefono || null,
        email: row.correo || null,
        pendingFields: required.filter((key) => !row[key]),
      }),
      db.insert(auditLogs).values({
        action: "import",
        entityType: "junta",
        entityId: id,
        newValues: { source: resolve(fileArgument), code: row.codigo },
      }),
    ]);
  }
} finally {
  await dispose();
}

console.info(`Importación terminada: ${rows.length} filas procesadas.`);
