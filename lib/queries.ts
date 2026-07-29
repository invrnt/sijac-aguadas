import { desc, eq, ne } from "drizzle-orm";
import { getDb } from "@/db";
import {
  activities,
  auditLogs,
  commitments,
  convenios,
  dignatarios,
  files,
  juntas,
  meetings,
  meetingAgendaItems,
  meetingAttendance,
  minutes,
  minuteSections,
  decisions,
} from "@/db/schema";
import {
  demoActivities,
  demoAudit,
  demoCommitments,
  demoConvenios,
  demoDignatarios,
  demoJuntas,
  demoMeetings,
  demoMinutes,
} from "@/lib/demo-data";
import { hasDatabase } from "@/lib/env";
import type {
  ActivityItem,
  AuditItem,
  CommitmentItem,
  JuntaSummary,
  MeetingItem,
  MinuteItem,
} from "@/types";

function completeness(record: typeof juntas.$inferSelect) {
  const fields = [
    record.code,
    record.officialName,
    record.neighborhood,
    record.zone,
    record.nit,
    record.legalEntityNumber,
    record.resolutionNumber,
    record.recognitionDate,
    record.address,
    record.phone,
    record.email,
    record.locationReference,
  ];
  return Math.round(
    (fields.filter((field) => field !== null && field !== "").length /
      fields.length) *
      100,
  );
}

function toSummary(record: typeof juntas.$inferSelect): JuntaSummary {
  return {
    id: record.id,
    code: record.code,
    officialName: record.officialName,
    neighborhood: record.neighborhood,
    municipality: record.municipality,
    department: record.department,
    zone: record.zone,
    affiliatesCount: record.affiliatesCount,
    status: record.status,
    nit: record.nit,
    legalEntityNumber: record.legalEntityNumber,
    resolutionNumber: record.resolutionNumber,
    recognitionDate: record.recognitionDate,
    recognitionEntity: record.recognitionEntity,
    address: record.address,
    phone: record.phone,
    email: record.email,
    locationReference: record.locationReference,
    completeness: completeness(record),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function listJuntasData({
  includeArchived = true,
}: {
  includeArchived?: boolean;
} = {}) {
  if (!hasDatabase) {
    return includeArchived
      ? demoJuntas
      : demoJuntas.filter((item) => item.status !== "archivada");
  }
  const db = getDb();
  const rows = includeArchived
    ? await db.select().from(juntas).orderBy(juntas.officialName)
    : await db
        .select()
        .from(juntas)
        .where(ne(juntas.status, "archivada"))
        .orderBy(juntas.officialName);
  return rows.map(toSummary);
}

export async function getJuntaBundle(id: string) {
  if (!hasDatabase) {
    const junta = demoJuntas.find((item) => item.id === id);
    if (!junta) return null;
    return {
      junta,
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
    };
  }

  const db = getDb();
  const [record] = await db.select().from(juntas).where(eq(juntas.id, id)).limit(1);
  if (!record) return null;
  const [officers, agreements, documents] = await Promise.all([
    db.select().from(dignatarios).where(eq(dignatarios.juntaId, id)),
    db.select().from(convenios).where(eq(convenios.juntaId, id)),
    db.select().from(files).where(eq(files.juntaId, id)),
  ]);
  return {
    junta: toSummary(record),
    dignatarios: officers.map((item) => ({
      id: item.id,
      juntaId: item.juntaId,
      position: item.position as "Presidente",
      fullName: item.fullName,
      documentNumber: item.documentNumber.replace(
        /^(.).*(.{2})$/,
        "$1•••$2",
      ),
      phone: item.phone ?? "",
      termStart: item.termStart ?? "",
      termEnd: item.termEnd ?? "",
      isCurrent: item.isCurrent,
    })),
    convenios: agreements.map((item) => ({
      id: item.id,
      juntaId: item.juntaId,
      number: item.number,
      year: item.year,
      description: item.description,
      status: item.status,
      value: item.value ? Number(item.value) : undefined,
    })),
    files: documents.map((item) => ({
      id: item.id,
      category: item.category,
      originalName: item.originalName,
      sizeBytes: item.sizeBytes,
      createdAt: item.createdAt.toISOString(),
    })),
  };
}

export async function listMeetingsData(): Promise<MeetingItem[]> {
  if (!hasDatabase) return demoMeetings;
  const db = getDb();
  const rows = await db
    .select({ meeting: meetings, juntaName: juntas.officialName })
    .from(meetings)
    .innerJoin(juntas, eq(meetings.juntaId, juntas.id))
    .orderBy(desc(meetings.startsAt));
  return rows.map(({ meeting, juntaName }) => ({
    id: meeting.id,
    juntaId: meeting.juntaId,
    juntaName,
    title: meeting.title,
    type: meeting.type,
    startsAt: meeting.startsAt.toISOString(),
    location: meeting.location,
    status: meeting.status,
    attendanceCount: 0,
  }));
}

export async function getMeetingBundle(id: string) {
  if (!hasDatabase) {
    const meeting = demoMeetings.find((item) => item.id === id);
    if (!meeting) return null;
    return {
      meeting,
      agenda: [
        { id: "agenda-1", position: 1, title: "Verificación del quórum" },
        { id: "agenda-2", position: 2, title: "Lectura y aprobación del orden del día" },
        { id: "agenda-3", position: 3, title: "Seguimiento a compromisos anteriores" },
      ],
      attendance:
        meeting.status === "finalizada"
          ? [
              {
                id: "attendance-1",
                fullName: "María Elena Gómez",
                documentNumber: "1•••42",
                roleOrRepresentation: "Presidenta",
                status: "asistio",
              },
              {
                id: "attendance-2",
                fullName: "Carlos Alberto Ríos",
                documentNumber: "7•••19",
                roleOrRepresentation: "Afiliado",
                status: "asistio",
              },
            ]
          : [],
    };
  }
  const db = getDb();
  const [row] = await db
    .select({ meeting: meetings, juntaName: juntas.officialName })
    .from(meetings)
    .innerJoin(juntas, eq(meetings.juntaId, juntas.id))
    .where(eq(meetings.id, id))
    .limit(1);
  if (!row) return null;
  const [agenda, attendance] = await Promise.all([
    db
      .select()
      .from(meetingAgendaItems)
      .where(eq(meetingAgendaItems.meetingId, id))
      .orderBy(meetingAgendaItems.position),
    db
      .select()
      .from(meetingAttendance)
      .where(eq(meetingAttendance.meetingId, id))
      .orderBy(meetingAttendance.fullName),
  ]);
  return {
    meeting: {
      id: row.meeting.id,
      juntaId: row.meeting.juntaId,
      juntaName: row.juntaName,
      title: row.meeting.title,
      type: row.meeting.type,
      startsAt: row.meeting.startsAt.toISOString(),
      location: row.meeting.location,
      status: row.meeting.status,
      attendanceCount: attendance.length,
    } satisfies MeetingItem,
    agenda,
    attendance: attendance.map((item) => ({
      ...item,
      documentNumber: item.documentNumber.replace(/^(.).*(.{2})$/, "$1•••$2"),
    })),
  };
}

export async function listMinutesData(): Promise<MinuteItem[]> {
  if (!hasDatabase) return demoMinutes;
  const db = getDb();
  const rows = await db
    .select({
      minute: minutes,
      meeting: meetings,
      juntaName: juntas.officialName,
    })
    .from(minutes)
    .innerJoin(meetings, eq(minutes.meetingId, meetings.id))
    .innerJoin(juntas, eq(meetings.juntaId, juntas.id))
    .orderBy(desc(minutes.updatedAt));
  return rows.map(({ minute, juntaName }) => ({
    id: minute.id,
    meetingId: minute.meetingId,
    juntaName,
    number: minute.number,
    year: minute.year,
    summary: minute.summary ?? "",
    status: minute.status,
    updatedAt: minute.updatedAt.toISOString(),
  }));
}

export async function getMinuteBundle(id: string) {
  if (!hasDatabase) {
    const minute = demoMinutes.find((item) => item.id === id);
    if (!minute) return null;
    return {
      minute,
      meeting: demoMeetings.find((item) => item.id === minute.meetingId) ?? demoMeetings[1],
      sections: [
        {
          id: "section-1",
          position: 1,
          heading: "Verificación del quórum",
          content:
            "Se verificó la asistencia registrada y se declaró quórum para deliberar.",
        },
        {
          id: "section-2",
          position: 2,
          heading: "Desarrollo del orden del día",
          content:
            "La asamblea revisó el plan anual y priorizó las acciones comunitarias del periodo.",
        },
      ],
      decisions: [
        {
          id: "decision-1",
          description: "Priorizar la actualización del inventario vial comunitario.",
          result: "Aprobada",
        },
      ],
    };
  }
  const db = getDb();
  const [row] = await db
    .select({
      minute: minutes,
      meeting: meetings,
      juntaName: juntas.officialName,
    })
    .from(minutes)
    .innerJoin(meetings, eq(minutes.meetingId, meetings.id))
    .innerJoin(juntas, eq(meetings.juntaId, juntas.id))
    .where(eq(minutes.id, id))
    .limit(1);
  if (!row) return null;
  const [sections, minuteDecisions] = await Promise.all([
    db
      .select()
      .from(minuteSections)
      .where(eq(minuteSections.minuteId, id))
      .orderBy(minuteSections.position),
    db.select().from(decisions).where(eq(decisions.minuteId, id)),
  ]);
  return {
    minute: {
      id: row.minute.id,
      meetingId: row.minute.meetingId,
      juntaName: row.juntaName,
      number: row.minute.number,
      year: row.minute.year,
      summary: row.minute.summary ?? "",
      status: row.minute.status,
      updatedAt: row.minute.updatedAt.toISOString(),
    } satisfies MinuteItem,
    meeting: {
      id: row.meeting.id,
      juntaId: row.meeting.juntaId,
      juntaName: row.juntaName,
      title: row.meeting.title,
      type: row.meeting.type,
      startsAt: row.meeting.startsAt.toISOString(),
      location: row.meeting.location,
      status: row.meeting.status,
      attendanceCount: 0,
    } satisfies MeetingItem,
    sections,
    decisions: minuteDecisions,
  };
}

export async function listCommitmentsData(): Promise<CommitmentItem[]> {
  if (!hasDatabase) return demoCommitments;
  const db = getDb();
  const rows = await db
    .select({ commitment: commitments, juntaName: juntas.officialName })
    .from(commitments)
    .innerJoin(juntas, eq(commitments.juntaId, juntas.id))
    .orderBy(desc(commitments.updatedAt));
  return rows.map(({ commitment, juntaName }) => ({
    id: commitment.id,
    juntaId: commitment.juntaId,
    juntaName,
    title: commitment.title,
    responsibleName: commitment.responsibleName,
    dueDate: commitment.dueDate ?? "",
    status: commitment.status,
    progress: commitment.status === "completado" ? 100 : 0,
  }));
}

export async function listActivitiesData(): Promise<ActivityItem[]> {
  if (!hasDatabase) return demoActivities;
  const db = getDb();
  const rows = await db
    .select({ activity: activities, juntaName: juntas.officialName })
    .from(activities)
    .innerJoin(juntas, eq(activities.juntaId, juntas.id))
    .orderBy(desc(activities.startDate));
  return rows.map(({ activity, juntaName }) => ({
    id: activity.id,
    juntaId: activity.juntaId,
    juntaName,
    title: activity.title,
    startDate: activity.startDate,
    location: activity.location ?? "",
    status: activity.status,
    beneficiariesCount: activity.beneficiariesCount ?? 0,
  }));
}

export async function listAuditData(): Promise<AuditItem[]> {
  if (!hasDatabase) return demoAudit;
  const db = getDb();
  const rows = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(500);
  return rows.map((item) => ({
    id: item.id,
    actor: item.actorEmail ?? "Cuenta histórica",
    action: item.action,
    entity: item.entityType,
    resource: item.entityId,
    createdAt: item.createdAt.toISOString(),
  }));
}
