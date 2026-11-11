import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpenText,
  CalendarPlus,
  ClipboardCheck,
  FilePlus2,
  Landmark,
  MapPinned,
  Search,
  UsersRound,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import {
  listActivitiesData,
  listAuditData,
  listCommitmentsData,
  listJuntasData,
  listMeetingsData,
} from "@/lib/queries";
import { auditSummary, greeting } from "@/lib/labels";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Panel" };

export default async function DashboardPage() {
  const user = await requireUser();
  const [juntas, commitments, activities, audit, meetings] = await Promise.all([
    listJuntasData(),
    listCommitmentsData(),
    listActivitiesData(),
    listAuditData(),
    listMeetingsData(),
  ]);
  const active = juntas.filter((junta) => junta.status === "activa").length;
  const affiliates = juntas.reduce(
    (total, junta) => total + junta.affiliatesCount,
    0,
  );
  const pending = commitments.filter(
    (item) => item.status !== "completado" && item.status !== "cancelado",
  ).length;
  const now = Date.now();
  const upcoming = meetings
    .filter(
      (meeting) =>
        new Date(meeting.startsAt).getTime() >= now - 3 * 60 * 60 * 1000 &&
        meeting.status !== "cancelada" &&
        meeting.status !== "finalizada",
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, 4);
  const openActivities = activities
    .filter((item) => item.status !== "completada" && item.status !== "cancelada")
    .slice(0, 4);
  const stats = [
    { href: "/juntas", icon: Landmark, value: juntas.length, label: "Juntas registradas" },
    { href: "/juntas", icon: MapPinned, value: active, label: "Juntas activas" },
    {
      href: "/reportes",
      icon: UsersRound,
      value: new Intl.NumberFormat("es-CO").format(affiliates),
      label: "Afiliados reportados",
    },
    { href: "/compromisos", icon: ClipboardCheck, value: pending, label: "Compromisos abiertos" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Resumen municipal"
        title={`${greeting()}, ${user.name.split(" ")[0]}`}
        description="Consulte el estado de la información comunitaria y continúe las tareas prioritarias."
        actions={
          <Link className="button button-primary" href="/juntas">
            <Search size={17} />
            Buscar junta
          </Link>
        }
      />
      <section className="stat-grid" aria-label="Indicadores principales">
        {stats.map((stat) => (
          <Link className="stat-card stat-card-link" href={stat.href} key={stat.label}>
            <stat.icon size={22} aria-hidden="true" />
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">
                {stat.label}
                <ArrowRight size={13} aria-hidden="true" />
              </div>
            </div>
          </Link>
        ))}
      </section>
      <div className="dashboard-grid">
        <section className="card" aria-labelledby="activity-title">
          <div className="card-header">
            <h2 id="activity-title">Actividad reciente</h2>
            {user.role === "admin" && (
              <Link className="table-action" href="/administracion/auditoria">
                Ver auditoría <ArrowRight size={13} />
              </Link>
            )}
          </div>
          <div className="activity-list">
            {audit.length === 0 && (
              <p className="list-empty">Aún no hay movimientos registrados.</p>
            )}
            {audit.slice(0, 5).map((item) => {
              const Icon =
                item.action === "create"
                  ? FilePlus2
                  : item.action === "upload"
                    ? BookOpenText
                    : Activity;
              return (
                <div className="activity-row" key={item.id}>
                  <span className="activity-icon">
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <span>
                    <strong>{auditSummary(item.action, item.entity)}</strong>
                    <span>{item.resource}</span>
                  </span>
                  <time dateTime={item.createdAt}>
                    {new Intl.DateTimeFormat("es-CO", {
                      timeZone: "America/Bogota",
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    }).format(new Date(item.createdAt))}
                  </time>
                </div>
              );
            })}
          </div>
        </section>
        <aside className="card card-padded" aria-labelledby="quick-title">
          <h2 id="quick-title">Acciones rápidas</h2>
          <div className="quick-actions">
            {user.role !== "consulta" && (
              <Link className="quick-action" href="/juntas/nueva">
                <FilePlus2 size={20} />
                Registrar JAC
              </Link>
            )}
            <Link className="quick-action" href="/juntas">
              <Search size={20} />
              Buscar junta
            </Link>
            {user.role !== "consulta" && (
              <Link className="quick-action" href="/reuniones?nueva=1">
                <CalendarPlus size={20} />
                Nueva reunión
              </Link>
            )}
            <Link className="quick-action" href="/reportes">
              <BookOpenText size={20} />
              Generar reporte
            </Link>
          </div>
        </aside>
      </div>
      <div className="dashboard-grid dashboard-grid-even">
        <section className="card">
          <div className="card-header">
            <h2>Próximas reuniones</h2>
            <Link className="table-action" href="/reuniones">
              Ver todas
            </Link>
          </div>
          <div className="compact-list">
            {upcoming.length === 0 && (
              <p className="list-empty">No hay reuniones programadas.</p>
            )}
            {upcoming.map((meeting) => (
              <Link className="compact-row compact-row-link" href={`/reuniones/${meeting.id}`} key={meeting.id}>
                <CalendarPlus size={18} aria-hidden="true" />
                <span>
                  <strong>{meeting.title}</strong>
                  <span>
                    {meeting.juntaName} ·{" "}
                    {new Intl.DateTimeFormat("es-CO", {
                      timeZone: "America/Bogota",
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    }).format(new Date(meeting.startsAt))}
                  </span>
                </span>
                <StatusBadge status={meeting.status} />
              </Link>
            ))}
          </div>
        </section>
        <section className="card">
          <div className="card-header">
            <h2>Actividades en curso</h2>
            <Link className="table-action" href="/actividades">
              Ver todas
            </Link>
          </div>
          <div className="compact-list">
            {openActivities.length === 0 && (
              <p className="list-empty">No hay actividades en curso.</p>
            )}
            {openActivities.map((activity) => (
              <div className="compact-row" key={activity.id}>
                <Activity size={18} aria-hidden="true" />
                <span>
                  <strong>{activity.title}</strong>
                  <span>{activity.juntaName}</span>
                </span>
                <StatusBadge status={activity.status} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
