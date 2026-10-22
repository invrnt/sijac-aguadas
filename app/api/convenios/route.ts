import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { auditLogs, convenios } from "@/db/schema";
import { authorizeApi } from "@/lib/api-auth";
import { hasDatabase } from "@/lib/env";

const input = z.object({
  juntaId: z.string().uuid(),
  number: z.string().trim().min(1).max(60),
  year: z.coerce.number().int().min(1950).max(2200),
  description: z.string().trim().min(4).max(3000),
  status: z.enum(["pendiente", "vigente", "suspendido", "finalizado"]),
  value: z.coerce.number().min(0).optional(),
});

export async function POST(request: Request) {
  const authorization = await authorizeApi("convenios.write");
  if (authorization.response || !authorization.user)
    return authorization.response;
  const payload = input.safeParse(await request.json());
  if (!payload.success)
    return NextResponse.json({ error: "Revise los datos del convenio." }, { status: 422 });
  if (!hasDatabase)
    return NextResponse.json(
      { data: { id: crypto.randomUUID(), ...payload.data }, demo: true },
      { status: 201 },
    );
  const db = getDb();
  const id = crypto.randomUUID();
  const [[created]] = await db.batch([
    db
      .insert(convenios)
      .values({
        ...payload.data,
        id,
        value: payload.data.value ?? null,
        createdBy: authorization.user!.id,
        updatedBy: authorization.user!.id,
      })
      .returning(),
    db.insert(auditLogs).values({
      actorId: authorization.user!.id,
      actorEmail: authorization.user!.email,
      action: "create",
      entityType: "convenio",
      entityId: id,
      newValues: payload.data,
    }),
  ]);
  return NextResponse.json({ data: created }, { status: 201 });
}
