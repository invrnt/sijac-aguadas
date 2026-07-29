import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import {
  auditLogs,
  meetingAgendaItems,
  meetingAttendance,
} from "@/db/schema";
import { authorizeApi } from "@/lib/api-auth";
import { hasDatabase } from "@/lib/env";

const agenda = z.object({
  kind: z.literal("agenda"),
  position: z.coerce.number().int().min(1).max(100),
  title: z.string().trim().min(3).max(240),
  description: z.string().trim().max(2000).optional(),
});

const attendance = z.object({
  kind: z.literal("attendance"),
  fullName: z.string().trim().min(4).max(180),
  documentNumber: z.string().trim().min(4).max(40),
  roleOrRepresentation: z.string().trim().max(180).optional(),
  status: z.enum(["asistio", "no_asistio", "excusa"]).default("asistio"),
});

const input = z.discriminatedUnion("kind", [agenda, attendance]);

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authorization = await authorizeApi("meetings.write");
  if (authorization.response || !authorization.user)
    return authorization.response;
  const meetingId = (await context.params).id;
  const payload = input.safeParse(await request.json());
  if (!payload.success)
    return NextResponse.json({ error: "Revise los datos del registro." }, { status: 422 });
  if (!hasDatabase)
    return NextResponse.json(
      { data: { id: crypto.randomUUID(), ...payload.data }, demo: true },
      { status: 201 },
    );
  const db = getDb();
  const [created] = await db.transaction(async (tx) => {
    const result =
      payload.data.kind === "agenda"
        ? await tx
            .insert(meetingAgendaItems)
            .values({
              meetingId,
              position: payload.data.position,
              title: payload.data.title,
              description: payload.data.description,
            })
            .returning()
        : await tx
            .insert(meetingAttendance)
            .values({
              meetingId,
              fullName: payload.data.fullName,
              documentNumber: payload.data.documentNumber,
              roleOrRepresentation: payload.data.roleOrRepresentation,
              status: payload.data.status,
              registeredBy: authorization.user!.id,
            })
            .returning();
    await tx.insert(auditLogs).values({
      actorId: authorization.user!.id,
      actorEmail: authorization.user!.email,
      action: "create",
      entityType:
        payload.data.kind === "agenda" ? "meeting_agenda_item" : "meeting_attendance",
      entityId: result[0].id,
      newValues:
        payload.data.kind === "attendance"
          ? { ...payload.data, documentNumber: "[REDACTED]" }
          : payload.data,
    });
    return result;
  });
  return NextResponse.json({ data: created }, { status: 201 });
}
