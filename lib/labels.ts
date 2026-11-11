const statusLabels: Record<string, string> = {
  en_revision: "en revisión",
  en_ejecucion: "en ejecución",
  asistio: "asistió",
  no_asistio: "no asistió",
};

export function statusLabel(status: string) {
  const normalized = status.toLowerCase();
  return statusLabels[normalized] ?? normalized.replaceAll("_", " ");
}

const actionLabels: Record<string, string> = {
  create: "Creó",
  update: "Actualizó",
  archive: "Archivó",
  upload: "Cargó",
  delete: "Eliminó",
  status_change: "Cambió el estado de",
};

const entityLabels: Record<string, string> = {
  junta: "JAC",
  jac: "JAC",
  convenio: "convenio",
  dignatario: "dignatario",
  file: "archivo",
  settings: "configuración",
  user: "usuario",
  minute_section: "sección de acta",
  decision: "decisión",
  meeting: "reunión",
  meetings: "reunión",
  reuniones: "reunión",
  commitments: "compromiso",
  compromisos: "compromiso",
  activities: "actividad",
  actividades: "actividad",
  minutes: "acta",
  meeting_agenda_item: "punto del orden del día",
  meeting_attendance: "asistencia",
  actas: "acta",
};

export function actionLabel(action: string) {
  return actionLabels[action] ?? action;
}

export function entityLabel(entity: string) {
  return entityLabels[entity.toLowerCase()] ?? entity.toLocaleLowerCase("es");
}

export function auditSummary(action: string, entity: string) {
  return `${actionLabel(action)} ${entityLabel(entity)}`;
}

export function roleLabel(role: string) {
  return role === "admin"
    ? "Administrador"
    : role === "editor"
      ? "Editor"
      : role === "consulta"
        ? "Consulta"
        : role;
}

export function greeting(date = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat("es-CO", {
      timeZone: "America/Bogota",
      hour: "numeric",
      hourCycle: "h23",
    }).format(date),
  );
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}
