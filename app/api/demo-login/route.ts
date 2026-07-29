import { NextResponse } from "next/server";
import { z } from "zod";
import { demoEnabled } from "@/lib/env";

const bodySchema = z.object({
  role: z.enum(["admin", "consulta"]),
});

export async function POST(request: Request) {
  if (!demoEnabled) {
    return NextResponse.json({ error: "No disponible" }, { status: 404 });
  }

  const result = bodySchema.safeParse(await request.json());
  if (!result.success) {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("sijac-demo-role", result.data.role, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("sijac-demo-role");
  return response;
}
