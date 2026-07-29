import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { auditLogs, dignatarios } from "@/db/schema";
import { authorizeApi } from "@/lib/api-auth";
import { hasDatabase } from "@/lib/env";

const input = z.object({
  juntaId: z.string().uuid(),
  position: z.enum([
    "Presidente",
    "Vicepresidente",
    "Secretario",
    "Tesorero",
    "Fiscal",
  ]),
  fullName: z.string().trim().min(4).max(180),
  documentNumber: z.string().trim().min(4).max(40),
  phone: z.string().trim().max(40).optional(),
  termStart: z.string().optional(),
  termEnd: z.string().optional(),
});

export async function POST(request: Request) {
  const authorization = await authorizeApi("dignatarios.write");
  if (authorization.response || !authorization.user)
    return authorization.response;
  const payload = input.safeParse(await request.json());
  if (!payload.success)
    return NextResponse.json({ error: "Revise los datos del dignatario." }, { status: 422 });
  if (!hasDatabase)
    return NextResponse.json(
      { data: { id: crypto.randomUUID(), ...payload.data, isCurrent: true }, demo: true },
      { status: 201 },
    );
  const db = getDb();
  const [created] = await db.transaction(async (tx) => {
    const result = await tx
      .insert(dignatarios)
      .values({
        ...payload.data,
        termStart: payload.data.termStart || null,
        termEnd: payload.data.termEnd || null,
        createdBy: authorization.user!.id,
        updatedBy: authorization.user!.id,
      })
      .returning();
    await tx.insert(auditLogs).values({
      actorId: authorization.user!.id,
      actorEmail: authorization.user!.email,
      action: "create",
      entityType: "dignatario",
      entityId: result[0].id,
      newValues: { ...payload.data, documentNumber: "[REDACTED]" },
    });
    return result;
  });
  return NextResponse.json({ data: created }, { status: 201 });
}
