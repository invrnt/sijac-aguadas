import type {
  ActivityItem,
  AuditItem,
  CommitmentItem,
  Convenio,
  Dignatario,
  JuntaSummary,
  MeetingItem,
  MinuteItem,
} from "@/types";

const places = [
  "Centro",
  "Pore",
  "Arma",
  "Encimadas",
  "La Mermita",
  "San Nicolás",
  "Viboral",
  "El Edén",
  "La Zulia",
  "Pito",
  "Alto de la Montaña",
  "Guaimaral",
  "La Chorrera",
  "El Diamante",
  "San José",
  "Los Chorros",
  "La Habana",
];

export const demoJuntas: JuntaSummary[] = Array.from(
  { length: 68 },
  (_, index) => {
    const number = index + 1;
    const place = places[index % places.length];
    const complete = index % 5 !== 0;
    return {
      id: `demo-jac-${String(number).padStart(2, "0")}`,
      code: `AG-${String(number).padStart(3, "0")}`,
      officialName: `JAC ${place}${index >= places.length ? ` ${Math.floor(index / places.length) + 1}` : ""}`,
      neighborhood: place,
      municipality: "Aguadas",
      department: "Caldas",
      zone: index % 4 === 0 ? "urbana" : "rural",
      affiliatesCount: 18 + ((index * 17) % 143),
      status:
        index === 15 ? "inactiva" : index === 50 ? "archivada" : "activa",
      nit: complete ? `901${String(120000 + index).padStart(6, "0")}-${index % 9}` : null,
      legalEntityNumber: complete ? `PJ-${1980 + (index % 40)}-${number}` : null,
      resolutionNumber: complete ? `RES-${100 + number}` : null,
      recognitionDate: complete ? `${2000 + (index % 22)}-03-15` : null,
      recognitionEntity: complete ? "Gobernación de Caldas" : null,
      address: index % 3 === 0 ? `Carrera ${3 + (index % 7)} # ${8 + number}-12` : null,
      phone: index % 4 !== 0 ? `310 555 ${String(1000 + number)}` : null,
      email: index % 5 !== 0 ? `jac${number}@demo.sijac.local` : null,
      locationReference: `Sector ${place}, Aguadas`,
      completeness: complete ? 88 - (index % 3) * 7 : 52,
      updatedAt: new Date(2026, 6, 28 - (index % 20)).toISOString(),
    };
  },
);

const currentJunta = demoJuntas[0];
const secondJunta = demoJuntas[1];

export const demoDignatarios: Dignatario[] = [
  ["Presidente", "María Elena Gómez", "1•••42", "310 555 0101"],
  ["Vicepresidente", "Carlos Alberto Ríos", "7•••19", "315 555 0102"],
  ["Secretario", "Diana Marcela López", "3•••86", "300 555 0103"],
  ["Tesorero", "Jorge Iván Arias", "9•••22", "312 555 0104"],
  ["Fiscal", "Lucía Hernández", "4•••07", "301 555 0105"],
].map(([position, fullName, documentNumber, phone], index) => ({
  id: `demo-dig-${index + 1}`,
  juntaId: currentJunta.id,
  position: position as Dignatario["position"],
  fullName,
  documentNumber,
  phone,
  termStart: "2024-07-01",
  termEnd: "2028-06-30",
  isCurrent: true,
}));

export const demoConvenios: Convenio[] = [
  {
    id: "demo-conv-1",
    juntaId: currentJunta.id,
    number: "CD-042",
    year: 2026,
    description: "Mejoramiento del salón comunal y accesibilidad",
    status: "vigente",
    value: 28500000,
  },
  {
    id: "demo-conv-2",
    juntaId: currentJunta.id,
    number: "CD-119",
    year: 2025,
    description: "Dotación comunitaria y mantenimiento preventivo",
    status: "finalizado",
    value: 12600000,
  },
];

export const demoMeetings: MeetingItem[] = [
  {
    id: "demo-meeting-1",
    juntaId: currentJunta.id,
    juntaName: currentJunta.officialName,
    title: "Asamblea general ordinaria",
    type: "Ordinaria",
    startsAt: "2026-08-03T19:00:00-05:00",
    location: "Salón comunal",
    status: "convocada",
    attendanceCount: 0,
  },
  {
    id: "demo-meeting-2",
    juntaId: secondJunta.id,
    juntaName: secondJunta.officialName,
    title: "Seguimiento al plan de trabajo",
    type: "Directiva",
    startsAt: "2026-07-24T17:30:00-05:00",
    location: "Casa de la Cultura",
    status: "finalizada",
    attendanceCount: 28,
  },
  {
    id: "demo-meeting-3",
    juntaId: demoJuntas[4].id,
    juntaName: demoJuntas[4].officialName,
    title: "Reunión extraordinaria de convivencia",
    type: "Extraordinaria",
    startsAt: "2026-07-30T18:00:00-05:00",
    location: "Escuela rural",
    status: "borrador",
    attendanceCount: 0,
  },
];

export const demoMinutes: MinuteItem[] = [
  {
    id: "demo-minute-1",
    meetingId: "demo-meeting-2",
    juntaName: secondJunta.officialName,
    number: "014",
    year: 2026,
    summary: "Seguimiento al plan anual y priorización de mejoras viales.",
    status: "en_revision",
    updatedAt: "2026-07-25T14:10:00-05:00",
  },
  {
    id: "demo-minute-2",
    meetingId: "demo-meeting-old",
    juntaName: currentJunta.officialName,
    number: "013",
    year: 2026,
    summary: "Aprobación de la jornada comunitaria del segundo semestre.",
    status: "cerrada",
    updatedAt: "2026-06-18T11:30:00-05:00",
  },
];

export const demoCommitments: CommitmentItem[] = [
  {
    id: "demo-commitment-1",
    juntaId: secondJunta.id,
    juntaName: secondJunta.officialName,
    title: "Consolidar cotizaciones para placa huella",
    responsibleName: "Comité de obras",
    dueDate: "2026-08-10",
    status: "en_curso",
    progress: 60,
  },
  {
    id: "demo-commitment-2",
    juntaId: currentJunta.id,
    juntaName: currentJunta.officialName,
    title: "Actualizar listado de afiliados",
    responsibleName: "Secretaría",
    dueDate: "2026-08-01",
    status: "pendiente",
    progress: 15,
  },
  {
    id: "demo-commitment-3",
    juntaId: demoJuntas[6].id,
    juntaName: demoJuntas[6].officialName,
    title: "Entregar evidencia de jornada ambiental",
    responsibleName: "Comité ambiental",
    dueDate: "2026-07-20",
    status: "bloqueado",
    progress: 45,
  },
];

export const demoActivities: ActivityItem[] = [
  {
    id: "demo-activity-1",
    juntaId: currentJunta.id,
    juntaName: currentJunta.officialName,
    title: "Jornada de limpieza de la quebrada",
    startDate: "2026-08-09",
    location: "Sector La Cascada",
    status: "planeada",
    beneficiariesCount: 85,
  },
  {
    id: "demo-activity-2",
    juntaId: secondJunta.id,
    juntaName: secondJunta.officialName,
    title: "Taller de participación juvenil",
    startDate: "2026-07-26",
    location: "Salón comunal",
    status: "en_ejecucion",
    beneficiariesCount: 32,
  },
  {
    id: "demo-activity-3",
    juntaId: demoJuntas[8].id,
    juntaName: demoJuntas[8].officialName,
    title: "Mercado campesino comunitario",
    startDate: "2026-07-12",
    location: "Parque principal",
    status: "completada",
    beneficiariesCount: 210,
  },
];

export const demoAudit: AuditItem[] = [
  {
    id: "audit-1",
    actor: "Administradora de demostración",
    action: "Actualizó",
    entity: "JAC",
    resource: currentJunta.officialName,
    createdAt: "2026-07-28T15:42:00-05:00",
  },
  {
    id: "audit-2",
    actor: "Administradora de demostración",
    action: "Cargó documento",
    entity: "Archivo",
    resource: "Resolución de personería jurídica",
    createdAt: "2026-07-28T14:08:00-05:00",
  },
  {
    id: "audit-3",
    actor: "Secretaría Desarrollo Comunitario",
    action: "Cerró",
    entity: "Acta",
    resource: "Acta 013 de 2026",
    createdAt: "2026-07-27T09:16:00-05:00",
  },
  {
    id: "audit-4",
    actor: "Administradora de demostración",
    action: "Cambió estado",
    entity: "Compromiso",
    resource: "Consolidar cotizaciones",
    createdAt: "2026-07-25T10:33:00-05:00",
  },
];
