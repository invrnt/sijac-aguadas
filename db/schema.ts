import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// D1 (SQLite) no tiene tipos nativos de fecha, UUID, booleano ni JSON:
// las fechas con hora se guardan como milisegundos, las fechas simples como
// texto ISO (YYYY-MM-DD) y los JSON como texto.
function timestamp(name: string) {
  return integer(name, { mode: "timestamp_ms" });
}

function boolean(name: string) {
  return integer(name, { mode: "boolean" });
}

function date(name: string) {
  return text(name);
}

function id() {
  return text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
}

function createdAt() {
  return timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull();
}

const timestamps = {
  createdAt: createdAt(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
};

// Better Auth
export const users = sqliteTable(
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
    banExpires: timestamp("ban_expires"),
    lastLoginAt: timestamp("last_login_at"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    uniqueIndex("users_username_unique").on(table.username),
    index("users_role_idx").on(table.role),
  ],
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
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

export const accounts = sqliteTable(
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
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
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

export const verifications = sqliteTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    ...timestamps,
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
);

export const rateLimits = sqliteTable("rate_limits", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: integer("last_request").notNull(),
});

// Catálogos y negocio
export const juntaStatus = [
  "activa",
  "inactiva",
  "archivada",
] as const;
export const zoneType = ["urbana", "rural"] as const;
export const agreementStatus = [
  "pendiente",
  "vigente",
  "suspendido",
  "finalizado",
] as const;
export const meetingStatus = [
  "borrador",
  "convocada",
  "en_curso",
  "finalizada",
  "cancelada",
] as const;
export const minuteStatus = [
  "borrador",
  "en_revision",
  "aprobada",
  "cerrada",
  "anulada",
] as const;
export const commitmentStatus = [
  "pendiente",
  "en_curso",
  "bloqueado",
  "completado",
  "cancelado",
] as const;
export const activityStatus = [
  "planeada",
  "en_ejecucion",
  "completada",
  "aplazada",
  "cancelada",
] as const;
export const fileStatus = ["activo", "archivado"] as const;
export const attendanceStatus = [
  "asistio",
  "no_asistio",
  "excusa",
] as const;

export const juntas = sqliteTable(
  "juntas",
  {
    id: id(),
    code: text("code").notNull(),
    officialName: text("official_name").notNull(),
    neighborhood: text("neighborhood").notNull(),
    sourceNeighborhood: text("source_neighborhood"),
    municipality: text("municipality").default("Aguadas").notNull(),
    department: text("department").default("Caldas").notNull(),
    zone: text("zone", { enum: zoneType }).notNull(),
    affiliatesCount: integer("affiliates_count").default(0).notNull(),
    affiliatesUpdatedAt: date("affiliates_updated_at"),
    status: text("status", { enum: juntaStatus }).default("activa").notNull(),
    previousStatus: text("previous_status", { enum: juntaStatus }),
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
    latitude: real("latitude"),
    longitude: real("longitude"),
    pendingFields: text("pending_fields", { mode: "json" })
      .$type<string[]>()
      .$defaultFn(() => [])
      .notNull(),
    archivedAt: timestamp("archived_at"),
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

export const dignatarios = sqliteTable(
  "dignatarios",
  {
    id: id(),
    juntaId: text("junta_id")
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

export const convenios = sqliteTable(
  "convenios",
  {
    id: id(),
    juntaId: text("junta_id")
      .notNull()
      .references(() => juntas.id, { onDelete: "restrict" }),
    number: text("number").notNull(),
    year: integer("year").notNull(),
    description: text("description").notNull(),
    status: text("status", { enum: agreementStatus }).default("pendiente").notNull(),
    value: real("value"),
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

export const meetings = sqliteTable(
  "meetings",
  {
    id: id(),
    juntaId: text("junta_id")
      .notNull()
      .references(() => juntas.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    type: text("type").default("ordinaria").notNull(),
    startsAt: timestamp("starts_at").notNull(),
    endsAt: timestamp("ends_at"),
    location: text("location").notNull(),
    status: text("status", { enum: meetingStatus }).default("borrador").notNull(),
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

export const meetingAgendaItems = sqliteTable(
  "meeting_agenda_items",
  {
    id: id(),
    meetingId: text("meeting_id")
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

export const meetingAttendance = sqliteTable(
  "meeting_attendance",
  {
    id: id(),
    meetingId: text("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "restrict" }),
    documentNumber: text("document_number").notNull(),
    fullName: text("full_name").notNull(),
    roleOrRepresentation: text("role_or_representation"),
    status: text("status", { enum: attendanceStatus }).default("asistio").notNull(),
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

export const minutes = sqliteTable(
  "minutes",
  {
    id: id(),
    meetingId: text("meeting_id")
      .notNull()
      .unique()
      .references(() => meetings.id, { onDelete: "restrict" }),
    number: text("number").notNull(),
    year: integer("year").notNull(),
    status: text("status", { enum: minuteStatus }).default("borrador").notNull(),
    summary: text("summary"),
    quorumRequired: integer("quorum_required"),
    quorumPresent: integer("quorum_present"),
    approvedAt: timestamp("approved_at"),
    closedAt: timestamp("closed_at"),
    reopenedAt: timestamp("reopened_at"),
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

export const minuteSections = sqliteTable(
  "minute_sections",
  {
    id: id(),
    minuteId: text("minute_id")
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

export const decisions = sqliteTable("decisions", {
  id: id(),
  minuteId: text("minute_id")
    .notNull()
    .references(() => minutes.id, { onDelete: "restrict" }),
  description: text("description").notNull(),
  result: text("result"),
  votesFor: integer("votes_for"),
  votesAgainst: integer("votes_against"),
  abstentions: integer("abstentions"),
  ...timestamps,
});

export const commitments = sqliteTable(
  "commitments",
  {
    id: id(),
    juntaId: text("junta_id")
      .notNull()
      .references(() => juntas.id, { onDelete: "restrict" }),
    minuteId: text("minute_id").references(() => minutes.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    description: text("description"),
    responsibleName: text("responsible_name").notNull(),
    dueDate: date("due_date"),
    status: text("status", { enum: commitmentStatus }).default("pendiente").notNull(),
    completedAt: timestamp("completed_at"),
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

export const commitmentUpdates = sqliteTable("commitment_updates", {
  id: id(),
  commitmentId: text("commitment_id")
    .notNull()
    .references(() => commitments.id, { onDelete: "cascade" }),
  note: text("note").notNull(),
  progressPercent: integer("progress_percent"),
  createdBy: text("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: createdAt(),
});

export const activities = sqliteTable(
  "activities",
  {
    id: id(),
    juntaId: text("junta_id")
      .notNull()
      .references(() => juntas.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    description: text("description"),
    responsibleName: text("responsible_name"),
    location: text("location"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    status: text("status", { enum: activityStatus }).default("planeada").notNull(),
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

export const activityUpdates = sqliteTable("activity_updates", {
  id: id(),
  activityId: text("activity_id")
    .notNull()
    .references(() => activities.id, { onDelete: "cascade" }),
  note: text("note").notNull(),
  createdBy: text("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: createdAt(),
});

export const files = sqliteTable(
  "files",
  {
    id: id(),
    juntaId: text("junta_id")
      .notNull()
      .references(() => juntas.id, { onDelete: "restrict" }),
    category: text("category").notNull(),
    originalName: text("original_name").notNull(),
    storagePath: text("storage_path").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    checksumSha256: text("checksum_sha256"),
    description: text("description"),
    status: text("status", { enum: fileStatus }).default("activo").notNull(),
    uploadedBy: text("uploaded_by").references(() => users.id, {
      onDelete: "set null",
    }),
    archivedAt: timestamp("archived_at"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("files_storage_path_unique").on(table.storagePath),
    index("files_junta_idx").on(table.juntaId),
    index("files_category_idx").on(table.category),
  ],
);

export const fileLinks = sqliteTable(
  "file_links",
  {
    fileId: text("file_id")
      .notNull()
      .references(() => files.id, { onDelete: "cascade" }),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({
      columns: [table.fileId, table.entityType, table.entityId],
    }),
    index("file_links_entity_idx").on(table.entityType, table.entityId),
  ],
);

export const observations = sqliteTable("observations", {
  id: id(),
  juntaId: text("junta_id")
    .notNull()
    .references(() => juntas.id, { onDelete: "restrict" }),
  content: text("content").notNull(),
  createdBy: text("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  ...timestamps,
});

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: id(),
    actorId: text("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    actorEmail: text("actor_email"),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    previousValues: text("previous_values", { mode: "json" }),
    newValues: text("new_values", { mode: "json" }),
    requestId: text("request_id"),
    ipAddress: text("ip_address"),
    createdAt: createdAt(),
  },
  (table) => [
    index("audit_entity_idx").on(table.entityType, table.entityId),
    index("audit_actor_idx").on(table.actorId),
    index("audit_date_idx").on(table.createdAt),
    index("audit_action_idx").on(table.action),
  ],
);

export const systemSettings = sqliteTable("system_settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).notNull(),
  description: text("description"),
  updatedBy: text("updated_by").references(() => users.id, {
    onDelete: "set null",
  }),
  ...timestamps,
});
