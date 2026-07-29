import { and, eq, ilike, ne, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { auditLogs, juntas } from "@/db/schema";
import { authorizeApi } from "@/lib/api-auth";
import { demoJuntas } from "@/lib/demo-data";
import { hasDatabase } from "@/lib/env";
import { juntaInput } from "@/lib/validators";

export async function GET(request: Request) {
  const authorization = await authorizeApi("juntas.read");
  if (authorization.response) return authorization.response;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const status = searchParams.get("status");
  const zone = searchParams.get("zone");

  if (!hasDatabase) {
    const normalized = query.toLocaleLowerCase("es");
    const result = demoJuntas.filter((junta) => {
      const matchesQuery =
        !normalized ||
        [
          junta.code,
          junta.officialName,
          junta.neighborhood,
          junta.nit,
          junta.legalEntityNumber,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLocaleLowerCase("es").includes(normalized),
          );
      return (
        matchesQuery &&
        (!status || junta.status === status) &&
        (!zone || junta.zone === zone)
      );
    });
    return NextResponse.json({ data: result, total: result.length, demo: true });
  }

  const db = getDb();
  const conditions = [];
  if (query) {
    conditions.push(
      or(
        ilike(juntas.code, `%${query}%`),
        ilike(juntas.officialName, `%${query}%`),
        ilike(juntas.neighborhood, `%${query}%`),
        ilike(juntas.nit, `%${query}%`),
        ilike(juntas.legalEntityNumber, `%${query}%`),
      ),
    );
  }
  if (status) conditions.push(eq(juntas.status, status as typeof juntas.status.enumValues[number]));
  else conditions.push(ne(juntas.status, "archivada"));
  if (zone) conditions.push(eq(juntas.zone, zone as typeof juntas.zone.enumValues[number]));

  const data = await db
    .select()
    .from(juntas)
    .where(and(...conditions))
    .orderBy(juntas.officialName)
    .limit(200);

  return NextResponse.json({ data, total: data.length });
}

export async function POST(request: Request) {
  const authorization = await authorizeApi("juntas.write");
  if (authorization.response || !authorization.user)
    return authorization.response;

  const payload = juntaInput.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      { error: "Revise los campos.", fields: payload.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  if (!hasDatabase) {
    return NextResponse.json(
      {
        data: {
          id: crypto.randomUUID(),
          ...payload.data,
          municipality: "Aguadas",
          department: "Caldas",
          completeness: 70,
          updatedAt: new Date().toISOString(),
        },
        demo: true,
      },
      { status: 201 },
    );
  }

  const db = getDb();
  try {
    const [created] = await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(juntas)
        .values({
          ...payload.data,
          createdBy: authorization.user!.id,
          updatedBy: authorization.user!.id,
        })
        .returning();
      await tx.insert(auditLogs).values({
        actorId: authorization.user!.id,
        actorEmail: authorization.user!.email,
        action: "create",
        entityType: "junta",
        entityId: inserted[0].id,
        newValues: payload.data,
      });
      return inserted;
    });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    const duplicate =
      error instanceof Error && /unique|duplicate/i.test(error.message);
    return NextResponse.json(
      {
        error: duplicate
          ? "Ya existe una JAC activa con ese código."
          : "No fue posible guardar la JAC.",
      },
      { status: duplicate ? 409 : 500 },
    );
  }
}
