import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

// Better Auth
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    username: text("username"),
    displayUsername: text("display_username"),
    role: text("role").default("user").notNull(),
    banned: boolean("banned").default(false),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    uniqueIndex("users_username_unique").on(table.username),
    index("users_role_idx").on(table.role),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("sessions_token_unique").on(table.token),
    index("sessions_user_idx").on(table.userId),
  ],
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("accounts_provider_account_unique").on(
      table.providerId,
      table.accountId,
    ),
    index("accounts_user_idx").on(table.userId),
  ],
);

export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
);

export const rateLimits = pgTable("rate_limits", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigintTimestamp("last_request").notNull(),
});

function bigintTimestamp(name: string) {
  return bigint(name, { mode: "number" });
}

// Catálogos y negocio
export const juntaStatus = pgEnum("junta_status", [
  "activa",
  "inactiva",
  "archivada",
]);
export const zoneType = pgEnum("zone_type", ["urbana", "rural"]);
export const agreementStatus = pgEnum("agreement_status", [
  "pendiente",
  "vigente",
  "suspendido",
  "finalizado",
]);
export const meetingStatus = pgEnum("meeting_status", [
  "borrador",
  "convocada",
  "en_curso",
  "finalizada",
  "cancelada",
]);
export const minuteStatus = pgEnum("minute_status", [
  "borrador",
  "en_revision",
  "aprobada",
  "cerrada",
  "anulada",
]);
export const commitmentStatus = pgEnum("commitment_status", [
  "pendiente",
  "en_curso",
  "bloqueado",
  "completado",
  "cancelado",
]);
export const activityStatus = pgEnum("activity_status", [
  "planeada",
  "en_ejecucion",
  "completada",
  "aplazada",
  "cancelada",
]);
export const fileStatus = pgEnum("file_status", ["activo", "archivado"]);
export const attendanceStatus = pgEnum("attendance_status", [
  "asistio",
  "no_asistio",
  "excusa",
]);

export const juntas = pgTable(
  "juntas",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull(),
    officialName: text("official_name").notNull(),
    neighborhood: text("neighborhood").notNull(),
    sourceNeighborhood: text("source_neighborhood"),
    municipality: text("municipality").default("Aguadas").notNull(),
    department: text("department").default("Caldas").notNull(),
    zone: zoneType("zone").notNull(),
    affiliatesCount: integer("affiliates_count").default(0).notNull(),
    affiliatesUpdatedAt: date("affiliates_updated_at"),
    status: juntaStatus("status").default("activa").notNull(),
    previousStatus: juntaStatus("previous_status"),
    nit: text("nit"),
    nitPending: boolean("nit_pending").default(false).notNull(),
    legalEntityNumber: text("legal_entity_number"),
    resolutionNumber: text("resolution_number"),
    recognitionDate: date("recognition_date"),
    recognitionEntity: text("recognition_entity"),
    address: text("address"),
    phone: text("phone"),
    email: text("email"),
    locationReference: text("location_reference"),
    latitude: numeric("latitude", { precision: 9, scale: 6 }),
    longitude: numeric("longitude", { precision: 9, scale: 6 }),
    pendingFields: text("pending_fields").array().default([]).notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    updatedBy: text("updated_by").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("juntas_code_active_unique")
      .on(table.code)
      .where(sql`${table.status} <> 'archivada'`),
    index("juntas_name_idx").on(table.officialName),
    index("juntas_neighborhood_idx").on(table.neighborhood),
    index("juntas_nit_idx").on(table.nit),
    index("juntas_legal_entity_idx").on(table.legalEntityNumber),
    index("juntas_status_idx").on(table.status),
  ],
);

export const dignatarios = pgTable(
  "dignatarios",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    juntaId: uuid("junta_id")
      .notNull()
      .references(() => juntas.id, { onDelete: "restrict" }),
    position: text("position").notNull(),
    fullName: text("full_name").notNull(),
    documentType: text("document_type").default("CC").notNull(),
    documentNumber: text("document_number").notNull(),
    phone: text("phone"),
    email: text("email"),
    termStart: date("term_start"),
    termEnd: date("term_end"),
    isCurrent: boolean("is_current").default(true).notNull(),
    electionRecordReference: text("election_record_reference"),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    updatedBy: text("updated_by").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [
    index("dignatarios_junta_idx").on(table.juntaId),
    index("dignatarios_document_idx").on(table.documentNumber),
    index("dignatarios_current_idx").on(table.juntaId, table.isCurrent),
  ],
);

export const convenios = pgTable(
  "convenios",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    juntaId: uuid("junta_id")
      .notNull()
      .references(() => juntas.id, { onDelete: "restrict" }),
    number: text("number").notNull(),
    year: integer("year").notNull(),
    description: text("description").notNull(),
    status: agreementStatus("status").default("pendiente").notNull(),
    value: numeric("value", { precision: 16, scale: 2 }),
    startDate: date("start_date"),
    endDate: date("end_date"),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    updatedBy: text("updated_by").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("convenios_number_year_unique").on(table.number, table.year),
    index("convenios_junta_idx").on(table.juntaId),
    index("convenios_status_idx").on(table.status),
  ],
);

export const meetings = pgTable(
  "meetings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    juntaId: uuid("junta_id")
      .notNull()
      .references(() => juntas.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    type: text("type").default("ordinaria").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    location: text("location").notNull(),
    status: meetingStatus("status").default("borrador").notNull(),
    notes: text("notes"),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    updatedBy: text("updated_by").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [
    index("meetings_junta_idx").on(table.juntaId),
    index("meetings_date_idx").on(table.startsAt),
    index("meetings_status_idx").on(table.status),
  ],
);

export const meetingAgendaItems = pgTable(
  "meeting_agenda_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    meetingId: uuid("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    expectedMinutes: integer("expected_minutes"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("meeting_agenda_position_unique").on(
      table.meetingId,
      table.position,
    ),
  ],
);

export const meetingAttendance = pgTable(
  "meeting_attendance",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    meetingId: uuid("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "restrict" }),
    documentNumber: text("document_number").notNull(),
    fullName: text("full_name").notNull(),
    roleOrRepresentation: text("role_or_representation"),
    status: attendanceStatus("status").default("asistio").notNull(),
    signatureStoragePath: text("signature_storage_path"),
    registeredBy: text("registered_by").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("meeting_attendance_person_unique").on(
      table.meetingId,
      table.documentNumber,
    ),
    index("meeting_attendance_meeting_idx").on(table.meetingId),
  ],
);

export const minutes = pgTable(
  "minutes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    meetingId: uuid("meeting_id")
      .notNull()
      .unique()
      .references(() => meetings.id, { onDelete: "restrict" }),
    number: text("number").notNull(),
    year: integer("year").notNull(),
    status: minuteStatus("status").default("borrador").notNull(),
    summary: text("summary"),
    quorumRequired: integer("quorum_required"),
    quorumPresent: integer("quorum_present"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    reopenedAt: timestamp("reopened_at", { withTimezone: true }),
    reopeningReason: text("reopening_reason"),
    cancellationReason: text("cancellation_reason"),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    updatedBy: text("updated_by").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("minutes_number_year_unique").on(table.number, table.year),
    index("minutes_status_idx").on(table.status),
  ],
);

export const minuteSections = pgTable(
  "minute_sections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    minuteId: uuid("minute_id")
      .notNull()
      .references(() => minutes.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    heading: text("heading").notNull(),
    content: text("content").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("minute_sections_position_unique").on(
      table.minuteId,
      table.position,
    ),
  ],
);

export const decisions = pgTable("decisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  minuteId: uuid("minute_id")
    .notNull()
    .references(() => minutes.id, { onDelete: "restrict" }),
  description: text("description").notNull(),
  result: text("result"),
  votesFor: integer("votes_for"),
  votesAgainst: integer("votes_against"),
  abstentions: integer("abstentions"),
  ...timestamps,
});

export const commitments = pgTable(
  "commitments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    juntaId: uuid("junta_id")
      .notNull()
      .references(() => juntas.id, { onDelete: "restrict" }),
    minuteId: uuid("minute_id").references(() => minutes.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    description: text("description"),
    responsibleName: text("responsible_name").notNull(),
    dueDate: date("due_date"),
    status: commitmentStatus("status").default("pendiente").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    updatedBy: text("updated_by").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [
    index("commitments_junta_idx").on(table.juntaId),
    index("commitments_status_due_idx").on(table.status, table.dueDate),
  ],
);

export const commitmentUpdates = pgTable("commitment_updates", {
  id: uuid("id").defaultRandom().primaryKey(),
  commitmentId: uuid("commitment_id")
    .notNull()
    .references(() => commitments.id, { onDelete: "cascade" }),
  note: text("note").notNull(),
  progressPercent: integer("progress_percent"),
  createdBy: text("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    juntaId: uuid("junta_id")
      .notNull()
      .references(() => juntas.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    description: text("description"),
    responsibleName: text("responsible_name"),
    location: text("location"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    status: activityStatus("status").default("planeada").notNull(),
    beneficiariesCount: integer("beneficiaries_count"),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    updatedBy: text("updated_by").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [
    index("activities_junta_idx").on(table.juntaId),
    index("activities_status_date_idx").on(table.status, table.startDate),
  ],
);

export const activityUpdates = pgTable("activity_updates", {
  id: uuid("id").defaultRandom().primaryKey(),
  activityId: uuid("activity_id")
    .notNull()
    .references(() => activities.id, { onDelete: "cascade" }),
  note: text("note").notNull(),
  createdBy: text("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const files = pgTable(
  "files",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    juntaId: uuid("junta_id")
      .notNull()
      .references(() => juntas.id, { onDelete: "restrict" }),
    category: text("category").notNull(),
    originalName: text("original_name").notNull(),
    storagePath: text("storage_path").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    checksumSha256: text("checksum_sha256"),
    description: text("description"),
    status: fileStatus("status").default("activo").notNull(),
    uploadedBy: text("uploaded_by").references(() => users.id, {
      onDelete: "set null",
    }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("files_storage_path_unique").on(table.storagePath),
    index("files_junta_idx").on(table.juntaId),
    index("files_category_idx").on(table.category),
  ],
);

export const fileLinks = pgTable(
  "file_links",
  {
    fileId: uuid("file_id")
      .notNull()
      .references(() => files.id, { onDelete: "cascade" }),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.fileId, table.entityType, table.entityId],
    }),
    index("file_links_entity_idx").on(table.entityType, table.entityId),
  ],
);

export const observations = pgTable("observations", {
  id: uuid("id").defaultRandom().primaryKey(),
  juntaId: uuid("junta_id")
    .notNull()
    .references(() => juntas.id, { onDelete: "restrict" }),
  content: text("content").notNull(),
  createdBy: text("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  ...timestamps,
});

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: text("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    actorEmail: text("actor_email"),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    previousValues: jsonb("previous_values"),
    newValues: jsonb("new_values"),
    requestId: text("request_id"),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_entity_idx").on(table.entityType, table.entityId),
    index("audit_actor_idx").on(table.actorId),
    index("audit_date_idx").on(table.createdAt),
    index("audit_action_idx").on(table.action),
  ],
);

export const systemSettings = pgTable("system_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  description: text("description"),
  updatedBy: text("updated_by").references(() => users.id, {
    onDelete: "set null",
  }),
  ...timestamps,
});
