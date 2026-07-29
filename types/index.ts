export type JuntaStatus = "activa" | "inactiva" | "archivada";
export type ZoneType = "urbana" | "rural";

export type JuntaSummary = {
  id: string;
  code: string;
  officialName: string;
  neighborhood: string;
  municipality: string;
  department: string;
  zone: ZoneType;
  affiliatesCount: number;
  status: JuntaStatus;
  nit?: string | null;
  legalEntityNumber?: string | null;
  resolutionNumber?: string | null;
  recognitionDate?: string | null;
  recognitionEntity?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  locationReference?: string | null;
  completeness: number;
  updatedAt: string;
};

export type Dignatario = {
  id: string;
  juntaId: string;
  position: "Presidente" | "Vicepresidente" | "Secretario" | "Tesorero" | "Fiscal";
  fullName: string;
  documentNumber: string;
  phone: string;
  termStart: string;
  termEnd: string;
  isCurrent: boolean;
};

export type Convenio = {
  id: string;
  juntaId: string;
  number: string;
  year: number;
  description: string;
  status: "pendiente" | "vigente" | "suspendido" | "finalizado";
  value?: number;
};

export type MeetingItem = {
  id: string;
  juntaId: string;
  juntaName: string;
  title: string;
  type: string;
  startsAt: string;
  location: string;
  status: "borrador" | "convocada" | "en_curso" | "finalizada" | "cancelada";
  attendanceCount: number;
};

export type MinuteItem = {
  id: string;
  meetingId: string;
  juntaName: string;
  number: string;
  year: number;
  summary: string;
  status: "borrador" | "en_revision" | "aprobada" | "cerrada" | "anulada";
  updatedAt: string;
};

export type CommitmentItem = {
  id: string;
  juntaId: string;
  juntaName: string;
  title: string;
  responsibleName: string;
  dueDate: string;
  status: "pendiente" | "en_curso" | "bloqueado" | "completado" | "cancelado";
  progress: number;
};

export type ActivityItem = {
  id: string;
  juntaId: string;
  juntaName: string;
  title: string;
  startDate: string;
  location: string;
  status: "planeada" | "en_ejecucion" | "completada" | "aplazada" | "cancelada";
  beneficiariesCount: number;
};

export type AuditItem = {
  id: string;
  actor: string;
  action: string;
  entity: string;
  resource: string;
  createdAt: string;
};
