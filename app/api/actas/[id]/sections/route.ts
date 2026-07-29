import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { auditLogs, decisions, minuteSections } from "@/db/schema";
import { authorizeApi } from "@/lib/api-auth";
import { hasDatabase } from "@/lib/env";

const sectionSchema = z.object({
  kind: z.literal("section"),
  position: z.coerce.number().int().min(1).max(100),
  heading: z.string().trim().min(3).max(240),
  content: z.string().trim().min(3).max(20000),
});
const decisionSchema = z.object({
  kind: z.literal("decision"),
  description: z.string().trim().min(3).max(5000),
  result: z.string().trim().max(500).optional(),
});
const input = z.discriminatedUnion("kind", [sectionSchema, decisionSchema]);

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authorization = await authorizeApi("minutes.write");
  if (authorization.response || !authorization.user)
    return authorization.response;
  const minuteId = (await context.params).id;
  const payload = input.safeParse(await request.json());
  if (!payload.success)
    return NextResponse.json({ error: "Revise el contenido del acta." }, { status: 422 });
  if (!hasDatabase)
    return NextResponse.json(
      { data: { id: crypto.randomUUID(), ...payload.data }, demo: true },
      { status: 201 },
    );
  const db = getDb();
  const [created] = await db.transaction(async (tx) => {
    const result =
      payload.data.kind === "section"
        ? await tx
            .insert(minuteSections)
            .values({
              minuteId,
              position: payload.data.position,
              heading: payload.data.heading,
              content: payload.data.content,
            })
            .returning()
        : await tx
            .insert(decisions)
            .values({
              minuteId,
              description: payload.data.description,
              result: payload.data.result,
            })
            .returning();
    await tx.insert(auditLogs).values({
      actorId: authorization.user!.id,
      actorEmail: authorization.user!.email,
      action: "create",
      entityType: payload.data.kind === "section" ? "minute_section" : "decision",
      entityId: result[0].id,
      newValues: payload.data,
    });
    return result;
  });
  return NextResponse.json({ data: created }, { status: 201 });
}
