CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_provider_account_unique` ON `accounts` (`provider_id`,`account_id`);--> statement-breakpoint
CREATE INDEX `accounts_user_idx` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`junta_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`responsible_name` text,
	`location` text,
	`start_date` text NOT NULL,
	`end_date` text,
	`status` text DEFAULT 'planeada' NOT NULL,
	`beneficiaries_count` integer,
	`created_by` text,
	`updated_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`junta_id`) REFERENCES `juntas`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `activities_junta_idx` ON `activities` (`junta_id`);--> statement-breakpoint
CREATE INDEX `activities_status_date_idx` ON `activities` (`status`,`start_date`);--> statement-breakpoint
CREATE TABLE `activity_updates` (
	`id` text PRIMARY KEY NOT NULL,
	`activity_id` text NOT NULL,
	`note` text NOT NULL,
	`created_by` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text,
	`actor_email` text,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`previous_values` text,
	`new_values` text,
	`request_id` text,
	`ip_address` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `audit_entity_idx` ON `audit_logs` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `audit_actor_idx` ON `audit_logs` (`actor_id`);--> statement-breakpoint
CREATE INDEX `audit_date_idx` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `audit_action_idx` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE TABLE `commitment_updates` (
	`id` text PRIMARY KEY NOT NULL,
	`commitment_id` text NOT NULL,
	`note` text NOT NULL,
	`progress_percent` integer,
	`created_by` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`commitment_id`) REFERENCES `commitments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `commitments` (
	`id` text PRIMARY KEY NOT NULL,
	`junta_id` text NOT NULL,
	`minute_id` text,
	`title` text NOT NULL,
	`description` text,
	`responsible_name` text NOT NULL,
	`due_date` text,
	`status` text DEFAULT 'pendiente' NOT NULL,
	`completed_at` integer,
	`created_by` text,
	`updated_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`junta_id`) REFERENCES `juntas`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`minute_id`) REFERENCES `minutes`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `commitments_junta_idx` ON `commitments` (`junta_id`);--> statement-breakpoint
CREATE INDEX `commitments_status_due_idx` ON `commitments` (`status`,`due_date`);--> statement-breakpoint
CREATE TABLE `convenios` (
	`id` text PRIMARY KEY NOT NULL,
	`junta_id` text NOT NULL,
	`number` text NOT NULL,
	`year` integer NOT NULL,
	`description` text NOT NULL,
	`status` text DEFAULT 'pendiente' NOT NULL,
	`value` real,
	`start_date` text,
	`end_date` text,
	`created_by` text,
	`updated_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`junta_id`) REFERENCES `juntas`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `convenios_number_year_unique` ON `convenios` (`number`,`year`);--> statement-breakpoint
CREATE INDEX `convenios_junta_idx` ON `convenios` (`junta_id`);--> statement-breakpoint
CREATE INDEX `convenios_status_idx` ON `convenios` (`status`);--> statement-breakpoint
CREATE TABLE `decisions` (
	`id` text PRIMARY KEY NOT NULL,
	`minute_id` text NOT NULL,
	`description` text NOT NULL,
	`result` text,
	`votes_for` integer,
	`votes_against` integer,
	`abstentions` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`minute_id`) REFERENCES `minutes`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `dignatarios` (
	`id` text PRIMARY KEY NOT NULL,
	`junta_id` text NOT NULL,
	`position` text NOT NULL,
	`full_name` text NOT NULL,
	`document_type` text DEFAULT 'CC' NOT NULL,
	`document_number` text NOT NULL,
	`phone` text,
	`email` text,
	`term_start` text,
	`term_end` text,
	`is_current` integer DEFAULT true NOT NULL,
	`election_record_reference` text,
	`created_by` text,
	`updated_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`junta_id`) REFERENCES `juntas`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `dignatarios_junta_idx` ON `dignatarios` (`junta_id`);--> statement-breakpoint
CREATE INDEX `dignatarios_document_idx` ON `dignatarios` (`document_number`);--> statement-breakpoint
CREATE INDEX `dignatarios_current_idx` ON `dignatarios` (`junta_id`,`is_current`);--> statement-breakpoint
CREATE TABLE `file_links` (
	`file_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`file_id`, `entity_type`, `entity_id`),
	FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `file_links_entity_idx` ON `file_links` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`junta_id` text NOT NULL,
	`category` text NOT NULL,
	`original_name` text NOT NULL,
	`storage_path` text NOT NULL,
	`mime_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`checksum_sha256` text,
	`description` text,
	`status` text DEFAULT 'activo' NOT NULL,
	`uploaded_by` text,
	`archived_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`junta_id`) REFERENCES `juntas`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `files_storage_path_unique` ON `files` (`storage_path`);--> statement-breakpoint
CREATE INDEX `files_junta_idx` ON `files` (`junta_id`);--> statement-breakpoint
CREATE INDEX `files_category_idx` ON `files` (`category`);--> statement-breakpoint
CREATE TABLE `juntas` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`official_name` text NOT NULL,
	`neighborhood` text NOT NULL,
	`source_neighborhood` text,
	`municipality` text DEFAULT 'Aguadas' NOT NULL,
	`department` text DEFAULT 'Caldas' NOT NULL,
	`zone` text NOT NULL,
	`affiliates_count` integer DEFAULT 0 NOT NULL,
	`affiliates_updated_at` text,
	`status` text DEFAULT 'activa' NOT NULL,
	`previous_status` text,
	`nit` text,
	`nit_pending` integer DEFAULT false NOT NULL,
	`legal_entity_number` text,
	`resolution_number` text,
	`recognition_date` text,
	`recognition_entity` text,
	`address` text,
	`phone` text,
	`email` text,
	`location_reference` text,
	`latitude` real,
	`longitude` real,
	`pending_fields` text NOT NULL,
	`archived_at` integer,
	`created_by` text,
	`updated_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `juntas_code_active_unique` ON `juntas` (`code`) WHERE "juntas"."status" <> 'archivada';--> statement-breakpoint
CREATE INDEX `juntas_name_idx` ON `juntas` (`official_name`);--> statement-breakpoint
CREATE INDEX `juntas_neighborhood_idx` ON `juntas` (`neighborhood`);--> statement-breakpoint
CREATE INDEX `juntas_nit_idx` ON `juntas` (`nit`);--> statement-breakpoint
CREATE INDEX `juntas_legal_entity_idx` ON `juntas` (`legal_entity_number`);--> statement-breakpoint
CREATE INDEX `juntas_status_idx` ON `juntas` (`status`);--> statement-breakpoint
CREATE TABLE `meeting_agenda_items` (
	`id` text PRIMARY KEY NOT NULL,
	`meeting_id` text NOT NULL,
	`position` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`expected_minutes` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `meeting_agenda_position_unique` ON `meeting_agenda_items` (`meeting_id`,`position`);--> statement-breakpoint
CREATE TABLE `meeting_attendance` (
	`id` text PRIMARY KEY NOT NULL,
	`meeting_id` text NOT NULL,
	`document_number` text NOT NULL,
	`full_name` text NOT NULL,
	`role_or_representation` text,
	`status` text DEFAULT 'asistio' NOT NULL,
	`signature_storage_path` text,
	`registered_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`registered_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `meeting_attendance_person_unique` ON `meeting_attendance` (`meeting_id`,`document_number`);--> statement-breakpoint
CREATE INDEX `meeting_attendance_meeting_idx` ON `meeting_attendance` (`meeting_id`);--> statement-breakpoint
CREATE TABLE `meetings` (
	`id` text PRIMARY KEY NOT NULL,
	`junta_id` text NOT NULL,
	`title` text NOT NULL,
	`type` text DEFAULT 'ordinaria' NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer,
	`location` text NOT NULL,
	`status` text DEFAULT 'borrador' NOT NULL,
	`notes` text,
	`created_by` text,
	`updated_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`junta_id`) REFERENCES `juntas`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `meetings_junta_idx` ON `meetings` (`junta_id`);--> statement-breakpoint
CREATE INDEX `meetings_date_idx` ON `meetings` (`starts_at`);--> statement-breakpoint
CREATE INDEX `meetings_status_idx` ON `meetings` (`status`);--> statement-breakpoint
CREATE TABLE `minute_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`minute_id` text NOT NULL,
	`position` integer NOT NULL,
	`heading` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`minute_id`) REFERENCES `minutes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `minute_sections_position_unique` ON `minute_sections` (`minute_id`,`position`);--> statement-breakpoint
CREATE TABLE `minutes` (
	`id` text PRIMARY KEY NOT NULL,
	`meeting_id` text NOT NULL,
	`number` text NOT NULL,
	`year` integer NOT NULL,
	`status` text DEFAULT 'borrador' NOT NULL,
	`summary` text,
	`quorum_required` integer,
	`quorum_present` integer,
	`approved_at` integer,
	`closed_at` integer,
	`reopened_at` integer,
	`reopening_reason` text,
	`cancellation_reason` text,
	`created_by` text,
	`updated_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `minutes_meeting_id_unique` ON `minutes` (`meeting_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `minutes_number_year_unique` ON `minutes` (`number`,`year`);--> statement-breakpoint
CREATE INDEX `minutes_status_idx` ON `minutes` (`status`);--> statement-breakpoint
CREATE TABLE `observations` (
	`id` text PRIMARY KEY NOT NULL,
	`junta_id` text NOT NULL,
	`content` text NOT NULL,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`junta_id`) REFERENCES `juntas`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`count` integer NOT NULL,
	`last_request` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rate_limits_key_unique` ON `rate_limits` (`key`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	`impersonated_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `system_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`updated_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`username` text,
	`display_username` text,
	`role` text DEFAULT 'user' NOT NULL,
	`banned` integer DEFAULT false,
	`ban_reason` text,
	`ban_expires` integer,
	`last_login_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verifications_identifier_idx` ON `verifications` (`identifier`);