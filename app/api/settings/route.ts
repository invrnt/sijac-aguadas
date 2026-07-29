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
  await db.transaction(async (tx) => {
    for (const [key, value] of Object.entries(payload.data)) {
      await tx
        .insert(systemSettings)
        .values({
          key,
          value,
          updatedBy: authorization.user!.id,
        })
        .onConflictDoUpdate({
          target: systemSettings.key,
          set: {
            value,
            updatedBy: authorization.user!.id,
            updatedAt: new Date(),
          },
        });
    }
    await tx.insert(auditLogs).values({
      actorId: authorization.user!.id,
      actorEmail: authorization.user!.email,
      action: "update",
      entityType: "settings",
      entityId: "system",
      newValues: payload.data,
    });
  });
  return NextResponse.json({ data: payload.data });
}
