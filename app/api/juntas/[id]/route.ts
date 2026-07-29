import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { auditLogs, convenios, dignatarios, files, juntas } from "@/db/schema";
import { authorizeApi } from "@/lib/api-auth";
import {
  demoConvenios,
  demoDignatarios,
  demoJuntas,
} from "@/lib/demo-data";
import { hasDatabase } from "@/lib/env";
import { juntaInput } from "@/lib/validators";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authorization = await authorizeApi("juntas.read");
  if (authorization.response) return authorization.response;
  const { id } = await context.params;

  if (!hasDatabase) {
    const junta = demoJuntas.find((item) => item.id === id);
    if (!junta)
      return NextResponse.json({ error: "JAC no encontrada." }, { status: 404 });
    return NextResponse.json({
      data: junta,
      dignatarios: demoDignatarios.filter((item) => item.juntaId === id),
      convenios: demoConvenios.filter((item) => item.juntaId === id),
      files: [
        {
          id: "demo-file-1",
          category: "Personería jurídica",
          originalName: "resolucion-personeria.pdf",
          sizeBytes: 824000,
          createdAt: "2026-07-18T12:00:00-05:00",
        },
        {
          id: "demo-file-2",
          category: "Fotografía",
          originalName: "fachada-salon-comunal.jpg",
          sizeBytes: 1250000,
          createdAt: "2026-07-20T09:30:00-05:00",
        },
      ],
      demo: true,
    });
  }

  const db = getDb();
  const [junta] = await db.select().from(juntas).where(eq(juntas.id, id)).limit(1);
  if (!junta)
    return NextResponse.json({ error: "JAC no encontrada." }, { status: 404 });

  const [officers, agreements, documents] = await Promise.all([
    db.select().from(dignatarios).where(eq(dignatarios.juntaId, id)),
    db.select().from(convenios).where(eq(convenios.juntaId, id)),
    db.select().from(files).where(eq(files.juntaId, id)),
  ]);
  return NextResponse.json({
    data: junta,
    dignatarios: officers,
    convenios: agreements,
    files: documents,
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authorization = await authorizeApi("juntas.write");
  if (authorization.response || !authorization.user)
    return authorization.response;
  const { id } = await context.params;
  const payload = juntaInput.partial().safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      { error: "Revise los campos.", fields: payload.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  if (!hasDatabase)
    return NextResponse.json({ data: { id, ...payload.data }, demo: true });

  const db = getDb();
  const [previous] = await db.select().from(juntas).where(eq(juntas.id, id)).limit(1);
  if (!previous)
    return NextResponse.json({ error: "JAC no encontrada." }, { status: 404 });

  const [updated] = await db.transaction(async (tx) => {
    const result = await tx
      .update(juntas)
      .set({ ...payload.data, updatedBy: authorization.user!.id })
      .where(eq(juntas.id, id))
      .returning();
    await tx.insert(auditLogs).values({
      actorId: authorization.user!.id,
      actorEmail: authorization.user!.email,
      action: "update",
      entityType: "junta",
      entityId: id,
      previousValues: previous,
      newValues: payload.data,
    });
    return result;
  });
  return NextResponse.json({ data: updated });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authorization = await authorizeApi("juntas.archive");
  if (authorization.response || !authorization.user)
    return authorization.response;
  const { id } = await context.params;
  if (!hasDatabase)
    return NextResponse.json({ data: { id, status: "archivada" }, demo: true });

  const db = getDb();
  const [previous] = await db.select().from(juntas).where(eq(juntas.id, id)).limit(1);
  if (!previous)
    return NextResponse.json({ error: "JAC no encontrada." }, { status: 404 });
  const [updated] = await db.transaction(async (tx) => {
    const result = await tx
      .update(juntas)
      .set({
        previousStatus: previous.status,
        status: "archivada",
        archivedAt: new Date(),
        updatedBy: authorization.user!.id,
      })
      .where(eq(juntas.id, id))
      .returning();
    await tx.insert(auditLogs).values({
      actorId: authorization.user!.id,
      actorEmail: authorization.user!.email,
      action: "archive",
      entityType: "junta",
      entityId: id,
      previousValues: { status: previous.status },
      newValues: { status: "archivada" },
    });
    return result;
  });
  return NextResponse.json({ data: updated });
}
