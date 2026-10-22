import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { auditLogs, files } from "@/db/schema";
import { authorizeApi } from "@/lib/api-auth";
import { hasDatabase } from "@/lib/env";
import {
  allowedFileTypes,
  getFileBucket,
  maxFileSize,
  safeFileName,
} from "@/lib/storage";

export async function POST(request: Request) {
  const authorization = await authorizeApi("files.write");
  if (authorization.response || !authorization.user)
    return authorization.response;

  const form = await request.formData();
  const file = form.get("file");
  const juntaId = String(form.get("juntaId") ?? "");
  const category = String(form.get("category") ?? "Otro").slice(0, 80);
  const description = String(form.get("description") ?? "").slice(0, 500);

  if (!(file instanceof File) || !juntaId) {
    return NextResponse.json(
      { error: "Seleccione un archivo y una JAC." },
      { status: 422 },
    );
  }
  if (!allowedFileTypes.has(file.type)) {
    return NextResponse.json(
      { error: "El tipo de archivo no está permitido." },
      { status: 415 },
    );
  }
  if (file.size > maxFileSize) {
    return NextResponse.json(
      { error: "El archivo supera el límite de 10 MB." },
      { status: 413 },
    );
  }

  if (!hasDatabase) {
    return NextResponse.json(
      {
        data: {
          id: crypto.randomUUID(),
          juntaId,
          category,
          originalName: file.name,
          sizeBytes: file.size,
        },
        demo: true,
      },
      { status: 201 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const checksum = createHash("sha256").update(bytes).digest("hex");
  const id = crypto.randomUUID();
  const storagePath = `${juntaId}/${id}-${safeFileName(file.name)}`;
  const bucket = getFileBucket();
  try {
    await bucket.put(storagePath, bytes, {
      httpMetadata: { contentType: file.type },
      sha256: checksum,
    });
  } catch {
    return NextResponse.json(
      { error: "No fue posible almacenar el archivo." },
      { status: 502 },
    );
  }

  const db = getDb();
  try {
    const [[created]] = await db.batch([
      db
        .insert(files)
        .values({
          id,
          juntaId,
          category,
          originalName: file.name,
          storagePath,
          mimeType: file.type,
          sizeBytes: file.size,
          checksumSha256: checksum,
          description,
          uploadedBy: authorization.user!.id,
        })
        .returning(),
      db.insert(auditLogs).values({
        actorId: authorization.user!.id,
        actorEmail: authorization.user!.email,
        action: "upload",
        entityType: "file",
        entityId: id,
        newValues: {
          juntaId,
          category,
          originalName: file.name,
          sizeBytes: file.size,
          checksum,
        },
      }),
    ]);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch {
    await bucket.delete(storagePath);
    return NextResponse.json(
      { error: "No fue posible registrar el archivo." },
      { status: 500 },
    );
  }
}
