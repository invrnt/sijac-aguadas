export const roles = ["admin", "consulta", "editor"] as const;
export type AppRole = (typeof roles)[number];

export const permissions = [
  "juntas.read",
  "juntas.write",
  "juntas.archive",
  "dignatarios.write",
  "convenios.write",
  "files.read",
  "files.write",
  "meetings.write",
  "minutes.write",
  "activities.write",
  "reports.read",
  "users.manage",
  "settings.manage",
  "audit.read",
] as const;

export type Permission = (typeof permissions)[number];

export const rolePermissions: Record<AppRole, readonly Permission[]> = {
  consulta: [
    "juntas.read",
    "files.read",
    "reports.read",
  ],
  editor: [
    "juntas.read",
    "juntas.write",
    "dignatarios.write",
    "convenios.write",
    "files.read",
    "files.write",
    "meetings.write",
    "minutes.write",
    "activities.write",
    "reports.read",
  ],
  admin: permissions,
};

export function normalizeRole(value: string | null | undefined): AppRole {
  if (value === "admin" || value === "editor") return value;
  return "consulta";
}

export function can(
  role: string | null | undefined,
  permission: Permission,
) {
  return rolePermissions[normalizeRole(role)].includes(permission);
}

export function requirePermission(
  role: string | null | undefined,
  permission: Permission,
) {
  if (!can(role, permission)) {
    throw new Error("FORBIDDEN");
  }
}

export function canTransition(
  entity: "junta" | "convenio" | "reunion" | "acta" | "compromiso" | "actividad",
  from: string,
  to: string,
) {
  const transitions: Record<string, Record<string, readonly string[]>> = {
    junta: {
      activa: ["inactiva", "archivada"],
      inactiva: ["activa", "archivada"],
      archivada: ["activa", "inactiva"],
    },
    convenio: {
      pendiente: ["vigente", "finalizado"],
      vigente: ["suspendido", "finalizado"],
      suspendido: ["vigente", "finalizado"],
      finalizado: [],
    },
    reunion: {
      borrador: ["convocada", "cancelada"],
      convocada: ["en_curso", "cancelada"],
      en_curso: ["finalizada"],
      finalizada: [],
      cancelada: [],
    },
    acta: {
      borrador: ["en_revision", "anulada"],
      en_revision: ["borrador", "aprobada", "anulada"],
      aprobada: ["cerrada", "anulada"],
      cerrada: ["en_revision", "anulada"],
      anulada: [],
    },
    compromiso: {
      pendiente: ["en_curso", "bloqueado", "cancelado"],
      en_curso: ["bloqueado", "completado", "cancelado"],
      bloqueado: ["pendiente", "en_curso", "cancelado"],
      completado: [],
      cancelado: [],
    },
    actividad: {
      planeada: ["en_ejecucion", "aplazada", "cancelada"],
      en_ejecucion: ["completada", "aplazada", "cancelada"],
      aplazada: ["planeada", "en_ejecucion", "cancelada"],
      completada: [],
      cancelada: [],
    },
  };

  return transitions[entity]?.[from]?.includes(to) ?? false;
}
