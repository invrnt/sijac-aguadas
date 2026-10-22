import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { files } from "@/db/schema";
import { authorizeApi } from "@/lib/api-auth";
import { hasDatabase } from "@/lib/env";
import { getFileBucket } from "@/lib/storage";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authorization = await authorizeApi("files.read");
  if (authorization.response) return authorization.response;
  const { id } = await context.params;
  if (!hasDatabase) {
    return NextResponse.json(
      { error: "La descarga de demostración no contiene datos reales." },
      { status: 404 },
    );
  }

  const db = getDb();
  const [record] = await db.select().from(files).where(eq(files.id, id)).limit(1);
  if (!record || record.status !== "activo") {
    return NextResponse.json(
      { error: "Archivo no encontrado o archivado." },
      { status: 404 },
    );
  }

  // El bucket R2 es privado: el archivo se entrega desde el Worker tras
  // verificar la sesión, en lugar de exponer una URL firmada.
  const object = await getFileBucket().get(record.storagePath);
  if (!object) {
    return NextResponse.json(
      { error: "No fue posible recuperar el archivo." },
      { status: 502 },
    );
  }
  return new NextResponse(object.body as unknown as ReadableStream, {
    headers: {
      "Content-Type": record.mimeType,
      "Content-Length": String(object.size),
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(record.originalName)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
