import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import {
  activities,
  auditLogs,
  commitments,
  meetings,
  minutes,
} from "@/db/schema";
import { authorizeApi } from "@/lib/api-auth";
import {
  demoActivities,
  demoCommitments,
  demoMeetings,
  demoMinutes,
} from "@/lib/demo-data";
import { hasDatabase } from "@/lib/env";
import { canTransition } from "@/lib/permissions";

const entities = ["reuniones", "actas", "compromisos", "actividades"] as const;
type Entity = (typeof entities)[number];

const base = z.object({
  juntaId: z.string().uuid(),
  title: z.string().trim().min(4).max(220),
});

const schemas = {
  reuniones: base.extend({
    type: z.string().trim().min(3).max(80).default("ordinaria"),
    startsAt: z.coerce.date(),
    location: z.string().trim().min(2).max(240),
    status: z
      .enum(["borrador", "convocada", "en_curso", "finalizada", "cancelada"])
      .default("borrador"),
    notes: z.string().trim().max(5000).optional(),
  }),
  actas: z.object({
    meetingId: z.string().uuid(),
    number: z.string().trim().min(1).max(30),
    year: z.coerce.number().int().min(2000).max(2200),
    summary: z.string().trim().max(10000).optional(),
    status: z
      .enum(["borrador", "en_revision", "aprobada", "cerrada", "anulada"])
      .default("borrador"),
  }),
  compromisos: base.extend({
    minuteId: z.string().uuid().optional(),
    description: z.string().trim().max(5000).optional(),
    responsibleName: z.string().trim().min(2).max(180),
    dueDate: z.string().optional(),
    status: z
      .enum(["pendiente", "en_curso", "bloqueado", "completado", "cancelado"])
      .default("pendiente"),
  }),
  actividades: base.extend({
    description: z.string().trim().max(5000).optional(),
    responsibleName: z.string().trim().max(180).optional(),
    location: z.string().trim().max(240).optional(),
    startDate: z.string(),
    endDate: z.string().optional(),
    beneficiariesCount: z.coerce.number().int().min(0).optional(),
    status: z
      .enum(["planeada", "en_ejecucion", "completada", "aplazada", "cancelada"])
      .default("planeada"),
  }),
};

function parseEntity(value: string): Entity | null {
  return entities.includes(value as Entity) ? (value as Entity) : null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ entity: string }> },
) {
  const authorization = await authorizeApi("juntas.read");
  if (authorization.response) return authorization.response;
  const entity = parseEntity((await context.params).entity);
  if (!entity)
    return NextResponse.json({ error: "Módulo no válido." }, { status: 404 });

  if (!hasDatabase) {
    const data = {
      reuniones: demoMeetings,
      actas: demoMinutes,
      compromisos: demoCommitments,
      actividades: demoActivities,
    }[entity];
    return NextResponse.json({ data, demo: true });
  }

  const db = getDb();
  const data =
    entity === "reuniones"
      ? await db.select().from(meetings).orderBy(desc(meetings.startsAt)).limit(200)
      : entity === "actas"
        ? await db.select().from(minutes).orderBy(desc(minutes.updatedAt)).limit(200)
        : entity === "compromisos"
          ? await db
              .select()
              .from(commitments)
              .orderBy(desc(commitments.updatedAt))
              .limit(200)
          : await db
              .select()
              .from(activities)
              .orderBy(desc(activities.startDate))
              .limit(200);
  return NextResponse.json({ data });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ entity: string }> },
) {
  const authorization = await authorizeApi(
    (await context.params).entity === "actas"
      ? "minutes.write"
      : (await context.params).entity === "actividades"
        ? "activities.write"
        : "meetings.write",
  );
  if (authorization.response || !authorization.user)
    return authorization.response;
  const entity = parseEntity((await context.params).entity);
  if (!entity)
    return NextResponse.json({ error: "Módulo no válido." }, { status: 404 });
  const parsed = schemas[entity].safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Revise los campos.", fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  if (!hasDatabase) {
    return NextResponse.json(
      { data: { id: crypto.randomUUID(), ...parsed.data }, demo: true },
      { status: 201 },
    );
  }

  const db = getDb();
  const actor = authorization.user;
  const id = crypto.randomUUID();
  const ownership = { id, createdBy: actor.id, updatedBy: actor.id };
  const insert =
    entity === "reuniones"
      ? db
          .insert(meetings)
          .values({
            ...(parsed.data as z.infer<typeof schemas.reuniones>),
            ...ownership,
          })
          .returning()
      : entity === "actas"
        ? db
            .insert(minutes)
            .values({
              ...(parsed.data as z.infer<typeof schemas.actas>),
              ...ownership,
            })
            .returning()
        : entity === "compromisos"
          ? db
              .insert(commitments)
              .values({
                ...(parsed.data as z.infer<typeof schemas.compromisos>),
                ...ownership,
              })
              .returning()
          : db
              .insert(activities)
              .values({
                ...(parsed.data as z.infer<typeof schemas.actividades>),
                ...ownership,
              })
              .returning();
  const [[created]] = await db.batch([
    insert,
    db.insert(auditLogs).values({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "create",
      entityType: entity,
      entityId: id,
      newValues: parsed.data,
    }),
  ]);
  return NextResponse.json({ data: created }, { status: 201 });
}

const statusSchema = z.object({
  id: z.string().uuid(),
  from: z.string(),
  to: z.string(),
  reason: z.string().trim().max(1000).optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ entity: string }> },
) {
  const entity = parseEntity((await context.params).entity);
  if (!entity)
    return NextResponse.json({ error: "Módulo no válido." }, { status: 404 });
  const authorization = await authorizeApi(
    entity === "actas"
      ? "minutes.write"
      : entity === "actividades"
        ? "activities.write"
        : "meetings.write",
  );
  if (authorization.response || !authorization.user)
    return authorization.response;
  const payload = statusSchema.safeParse(await request.json());
  if (!payload.success)
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 422 });

  const transitionEntity = {
    reuniones: "reunion",
    actas: "acta",
    compromisos: "compromiso",
    actividades: "actividad",
  }[entity] as Parameters<typeof canTransition>[0];
  if (!canTransition(transitionEntity, payload.data.from, payload.data.to)) {
    return NextResponse.json(
      { error: "La transición de estado no está permitida." },
      { status: 409 },
    );
  }
  if (!hasDatabase)
    return NextResponse.json({
      data: { id: payload.data.id, status: payload.data.to },
      demo: true,
    });

  const db = getDb();
  const table =
    entity === "reuniones"
      ? meetings
      : entity === "actas"
        ? minutes
        : entity === "compromisos"
          ? commitments
          : activities;

  const [[result]] = await db.batch([
    db
      .update(table)
      .set({ status: payload.data.to as never, updatedBy: authorization.user!.id })
      .where(eq(table.id, payload.data.id))
      .returning(),
    db.insert(auditLogs).values({
      actorId: authorization.user!.id,
      actorEmail: authorization.user!.email,
      action: "status_change",
      entityType: entity,
      entityId: payload.data.id,
      previousValues: { status: payload.data.from },
      newValues: { status: payload.data.to, reason: payload.data.reason },
    }),
  ]);
  return NextResponse.json({ data: result });
}
