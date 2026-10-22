import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { demoEnabled, hasDatabase } from "@/lib/env";
import { normalizeRole, type AppRole } from "@/lib/permissions";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  demo: boolean;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!hasDatabase) {
    if (!demoEnabled) return null;
    const cookieStore = await cookies();
    const demoRole = cookieStore.get("sijac-demo-role")?.value;
    if (!demoRole) return null;
    return {
      id: `demo-${demoRole}`,
      name:
        demoRole === "admin"
          ? "Administradora de demostración"
          : "Usuario de consulta",
      email: `${demoRole}@demo.sijac.local`,
      role: normalizeRole(demoRole),
      demo: true,
    };
  }

  const { createAuth } = await import("@/lib/auth");
  const session = await createAuth().api.getSession({
    headers: await headers(),
  });
  if (!session) return null;

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: normalizeRole(session.user.role),
    demo: false,
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/iniciar-sesion");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/panel?error=sin-permiso");
  return user;
}
