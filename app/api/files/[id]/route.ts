import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { files } from "@/db/schema";
import { authorizeApi } from "@/lib/api-auth";
import { env, hasDatabase } from "@/lib/env";
import { getStorageAdmin } from "@/lib/storage";

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
  const { data, error } = await getStorageAdmin().storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .createSignedUrl(record.storagePath, 60, {
      download: record.originalName,
    });
  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: "No fue posible autorizar la descarga." },
      { status: 502 },
    );
  }
  return NextResponse.redirect(data.signedUrl, 307);
}
