CREATE TYPE "public"."activity_status" AS ENUM('planeada', 'en_ejecucion', 'completada', 'aplazada', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."agreement_status" AS ENUM('pendiente', 'vigente', 'suspendido', 'finalizado');--> statement-breakpoint
CREATE TYPE "public"."attendance_status" AS ENUM('asistio', 'no_asistio', 'excusa');--> statement-breakpoint
CREATE TYPE "public"."commitment_status" AS ENUM('pendiente', 'en_curso', 'bloqueado', 'completado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."file_status" AS ENUM('activo', 'archivado');--> statement-breakpoint
CREATE TYPE "public"."junta_status" AS ENUM('activa', 'inactiva', 'archivada');--> statement-breakpoint
CREATE TYPE "public"."meeting_status" AS ENUM('borrador', 'convocada', 'en_curso', 'finalizada', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."minute_status" AS ENUM('borrador', 'en_revision', 'aprobada', 'cerrada', 'anulada');--> statement-breakpoint
CREATE TYPE "public"."zone_type" AS ENUM('urbana', 'rural');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"junta_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"responsible_name" text,
	"location" text,
	"start_date" date NOT NULL,
	"end_date" date,
	"status" "activity_status" DEFAULT 'planeada' NOT NULL,
	"beneficiaries_count" integer,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity_id" uuid NOT NULL,
	"note" text NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" text,
	"actor_email" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"previous_values" jsonb,
	"new_values" jsonb,
	"request_id" text,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commitment_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"commitment_id" uuid NOT NULL,
	"note" text NOT NULL,
	"progress_percent" integer,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commitments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"junta_id" uuid NOT NULL,
	"minute_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"responsible_name" text NOT NULL,
	"due_date" date,
	"status" "commitment_status" DEFAULT 'pendiente' NOT NULL,
	"completed_at" timestamp with time zone,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "convenios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"junta_id" uuid NOT NULL,
	"number" text NOT NULL,
	"year" integer NOT NULL,
	"description" text NOT NULL,
	"status" "agreement_status" DEFAULT 'pendiente' NOT NULL,
	"value" numeric(16, 2),
	"start_date" date,
	"end_date" date,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"minute_id" uuid NOT NULL,
	"description" text NOT NULL,
	"result" text,
	"votes_for" integer,
	"votes_against" integer,
	"abstentions" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dignatarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"junta_id" uuid NOT NULL,
	"position" text NOT NULL,
	"full_name" text NOT NULL,
	"document_type" text DEFAULT 'CC' NOT NULL,
	"document_number" text NOT NULL,
	"phone" text,
	"email" text,
	"term_start" date,
	"term_end" date,
	"is_current" boolean DEFAULT true NOT NULL,
	"election_record_reference" text,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file_links" (
	"file_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "file_links_file_id_entity_type_entity_id_pk" PRIMARY KEY("file_id","entity_type","entity_id")
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"junta_id" uuid NOT NULL,
	"category" text NOT NULL,
	"original_name" text NOT NULL,
	"storage_path" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"checksum_sha256" text,
	"description" text,
	"status" "file_status" DEFAULT 'activo' NOT NULL,
	"uploaded_by" text,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "juntas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"official_name" text NOT NULL,
	"neighborhood" text NOT NULL,
	"source_neighborhood" text,
	"municipality" text DEFAULT 'Aguadas' NOT NULL,
	"department" text DEFAULT 'Caldas' NOT NULL,
	"zone" "zone_type" NOT NULL,
	"affiliates_count" integer DEFAULT 0 NOT NULL,
	"affiliates_updated_at" date,
	"status" "junta_status" DEFAULT 'activa' NOT NULL,
	"previous_status" "junta_status",
	"nit" text,
	"nit_pending" boolean DEFAULT false NOT NULL,
	"legal_entity_number" text,
	"resolution_number" text,
	"recognition_date" date,
	"recognition_entity" text,
	"address" text,
	"phone" text,
	"email" text,
	"location_reference" text,
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"pending_fields" text[] DEFAULT '{}' NOT NULL,
	"archived_at" timestamp with time zone,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meeting_agenda_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meeting_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"expected_minutes" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meeting_attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meeting_id" uuid NOT NULL,
	"document_number" text NOT NULL,
	"full_name" text NOT NULL,
	"role_or_representation" text,
	"status" "attendance_status" DEFAULT 'asistio' NOT NULL,
	"signature_storage_path" text,
	"registered_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"junta_id" uuid NOT NULL,
	"title" text NOT NULL,
	"type" text DEFAULT 'ordinaria' NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"location" text NOT NULL,
	"status" "meeting_status" DEFAULT 'borrador' NOT NULL,
	"notes" text,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "minute_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"minute_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"heading" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "minutes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meeting_id" uuid NOT NULL,
	"number" text NOT NULL,
	"year" integer NOT NULL,
	"status" "minute_status" DEFAULT 'borrador' NOT NULL,
	"summary" text,
	"quorum_required" integer,
	"quorum_present" integer,
	"approved_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"reopened_at" timestamp with time zone,
	"reopening_reason" text,
	"cancellation_reason" text,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "minutes_meeting_id_unique" UNIQUE("meeting_id")
);
--> statement-breakpoint
CREATE TABLE "observations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"junta_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "rate_limits_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"username" text,
	"display_username" text,
	"role" text DEFAULT 'user' NOT NULL,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_junta_id_juntas_id_fk" FOREIGN KEY ("junta_id") REFERENCES "public"."juntas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_updates" ADD CONSTRAINT "activity_updates_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_updates" ADD CONSTRAINT "activity_updates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commitment_updates" ADD CONSTRAINT "commitment_updates_commitment_id_commitments_id_fk" FOREIGN KEY ("commitment_id") REFERENCES "public"."commitments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commitment_updates" ADD CONSTRAINT "commitment_updates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commitments" ADD CONSTRAINT "commitments_junta_id_juntas_id_fk" FOREIGN KEY ("junta_id") REFERENCES "public"."juntas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commitments" ADD CONSTRAINT "commitments_minute_id_minutes_id_fk" FOREIGN KEY ("minute_id") REFERENCES "public"."minutes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commitments" ADD CONSTRAINT "commitments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commitments" ADD CONSTRAINT "commitments_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convenios" ADD CONSTRAINT "convenios_junta_id_juntas_id_fk" FOREIGN KEY ("junta_id") REFERENCES "public"."juntas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convenios" ADD CONSTRAINT "convenios_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convenios" ADD CONSTRAINT "convenios_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_minute_id_minutes_id_fk" FOREIGN KEY ("minute_id") REFERENCES "public"."minutes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dignatarios" ADD CONSTRAINT "dignatarios_junta_id_juntas_id_fk" FOREIGN KEY ("junta_id") REFERENCES "public"."juntas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dignatarios" ADD CONSTRAINT "dignatarios_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dignatarios" ADD CONSTRAINT "dignatarios_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_links" ADD CONSTRAINT "file_links_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_junta_id_juntas_id_fk" FOREIGN KEY ("junta_id") REFERENCES "public"."juntas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "juntas" ADD CONSTRAINT "juntas_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "juntas" ADD CONSTRAINT "juntas_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_agenda_items" ADD CONSTRAINT "meeting_agenda_items_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_attendance" ADD CONSTRAINT "meeting_attendance_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_attendance" ADD CONSTRAINT "meeting_attendance_registered_by_users_id_fk" FOREIGN KEY ("registered_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_junta_id_juntas_id_fk" FOREIGN KEY ("junta_id") REFERENCES "public"."juntas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "minute_sections" ADD CONSTRAINT "minute_sections_minute_id_minutes_id_fk" FOREIGN KEY ("minute_id") REFERENCES "public"."minutes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "minutes" ADD CONSTRAINT "minutes_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "minutes" ADD CONSTRAINT "minutes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "minutes" ADD CONSTRAINT "minutes_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "observations_junta_id_juntas_id_fk" FOREIGN KEY ("junta_id") REFERENCES "public"."juntas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "observations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_account_unique" ON "accounts" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activities_junta_idx" ON "activities" USING btree ("junta_id");--> statement-breakpoint
CREATE INDEX "activities_status_date_idx" ON "activities" USING btree ("status","start_date");--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_actor_idx" ON "audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "audit_date_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "commitments_junta_idx" ON "commitments" USING btree ("junta_id");--> statement-breakpoint
CREATE INDEX "commitments_status_due_idx" ON "commitments" USING btree ("status","due_date");--> statement-breakpoint
CREATE UNIQUE INDEX "convenios_number_year_unique" ON "convenios" USING btree ("number","year");--> statement-breakpoint
CREATE INDEX "convenios_junta_idx" ON "convenios" USING btree ("junta_id");--> statement-breakpoint
CREATE INDEX "convenios_status_idx" ON "convenios" USING btree ("status");--> statement-breakpoint
CREATE INDEX "dignatarios_junta_idx" ON "dignatarios" USING btree ("junta_id");--> statement-breakpoint
CREATE INDEX "dignatarios_document_idx" ON "dignatarios" USING btree ("document_number");--> statement-breakpoint
CREATE INDEX "dignatarios_current_idx" ON "dignatarios" USING btree ("junta_id","is_current");--> statement-breakpoint
CREATE INDEX "file_links_entity_idx" ON "file_links" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "files_storage_path_unique" ON "files" USING btree ("storage_path");--> statement-breakpoint
CREATE INDEX "files_junta_idx" ON "files" USING btree ("junta_id");--> statement-breakpoint
CREATE INDEX "files_category_idx" ON "files" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "juntas_code_active_unique" ON "juntas" USING btree ("code") WHERE "juntas"."status" <> 'archivada';--> statement-breakpoint
CREATE INDEX "juntas_name_idx" ON "juntas" USING btree ("official_name");--> statement-breakpoint
CREATE INDEX "juntas_neighborhood_idx" ON "juntas" USING btree ("neighborhood");--> statement-breakpoint
CREATE INDEX "juntas_nit_idx" ON "juntas" USING btree ("nit");--> statement-breakpoint
CREATE INDEX "juntas_legal_entity_idx" ON "juntas" USING btree ("legal_entity_number");--> statement-breakpoint
CREATE INDEX "juntas_status_idx" ON "juntas" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "meeting_agenda_position_unique" ON "meeting_agenda_items" USING btree ("meeting_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "meeting_attendance_person_unique" ON "meeting_attendance" USING btree ("meeting_id","document_number");--> statement-breakpoint
CREATE INDEX "meeting_attendance_meeting_idx" ON "meeting_attendance" USING btree ("meeting_id");--> statement-breakpoint
CREATE INDEX "meetings_junta_idx" ON "meetings" USING btree ("junta_id");--> statement-breakpoint
CREATE INDEX "meetings_date_idx" ON "meetings" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "meetings_status_idx" ON "meetings" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "minute_sections_position_unique" ON "minute_sections" USING btree ("minute_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "minutes_number_year_unique" ON "minutes" USING btree ("number","year");--> statement-breakpoint
CREATE INDEX "minutes_status_idx" ON "minutes" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_unique" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_unique" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");