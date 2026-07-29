import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { can, type Permission } from "@/lib/permissions";

export async function authorizeApi(permission: Permission) {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Debe iniciar sesión." },
        { status: 401 },
      ),
    };
  }

  if (!can(user.role, permission)) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "No tiene permiso para realizar esta acción." },
        { status: 403 },
      ),
    };
  }

  return { user, response: null };
}
