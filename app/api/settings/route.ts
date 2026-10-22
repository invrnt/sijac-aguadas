import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { auditLogs, systemSettings } from "@/db/schema";
import { authorizeApi } from "@/lib/api-auth";
import { hasDatabase } from "@/lib/env";

const settingsSchema = z.object({
  entityName: z.string().trim().min(3).max(180),
  officeName: z.string().trim().min(3).max(180),
  identityVisibility: z.enum(["masked", "admin", "full"]),
  maxFileSize: z.enum(["5", "10", "20"]),
  documentTypes: z.string().trim().min(3).max(1000),
});

export async function PATCH(request: Request) {
  const authorization = await authorizeApi("settings.manage");
  if (authorization.response || !authorization.user)
    return authorization.response;
  const payload = settingsSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      { error: "Revise los valores de configuración." },
      { status: 422 },
    );
  }
  if (!hasDatabase)
    return NextResponse.json({ data: payload.data, demo: true });

  const db = getDb();
  const actorId = authorization.user!.id;
  await db.batch([
    db.insert(auditLogs).values({
      actorId,
      actorEmail: authorization.user!.email,
      action: "update",
      entityType: "settings",
      entityId: "system",
      newValues: payload.data,
    }),
    ...Object.entries(payload.data).map(([key, value]) =>
      db
        .insert(systemSettings)
        .values({ key, value, updatedBy: actorId })
        .onConflictDoUpdate({
          target: systemSettings.key,
          set: { value, updatedBy: actorId, updatedAt: new Date() },
        }),
    ),
  ]);
  return NextResponse.json({ data: payload.data });
}
