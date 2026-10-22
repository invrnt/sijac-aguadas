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

  return (
    <>
      <PageHeader
        eyebrow="Resumen municipal"
        title={`Buenos días, ${user.name.split(" ")[0]}`}
        description="Consulte el estado de la información comunitaria y continúe las tareas prioritarias."
        actions={
          <Link className="button button-primary" href="/juntas">
            <Search size={17} />
            Buscar junta
          </Link>
        }
      />
      <section className="stat-grid" aria-label="Indicadores principales">
        <article className="stat-card">
          <Landmark size={22} aria-hidden="true" />
          <div>
            <div className="stat-value">{juntas.length}</div>
            <div className="stat-label">Juntas registradas</div>
          </div>
        </article>
        <article className="stat-card">
          <MapPinned size={22} aria-hidden="true" />
          <div>
            <div className="stat-value">{active}</div>
            <div className="stat-label">Juntas activas</div>
          </div>
        </article>
        <article className="stat-card">
          <UsersRound size={22} aria-hidden="true" />
          <div>
            <div className="stat-value">
              {new Intl.NumberFormat("es-CO").format(affiliates)}
            </div>
            <div className="stat-label">Afiliados reportados</div>
          </div>
        </article>
        <article className="stat-card">
          <ClipboardCheck size={22} aria-hidden="true" />
          <div>
            <div className="stat-value">{pending}</div>
            <div className="stat-label">Compromisos abiertos</div>
          </div>
        </article>
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
            {audit.slice(0, 4).map((item, index) => {
              const Icon = index === 1 ? FilePlus2 : index === 2 ? BookOpenText : Activity;
              return (
                <div className="activity-row" key={item.id}>
                  <span className="activity-icon">
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <span>
                    <strong>
                      {item.action} {item.entity.toLocaleLowerCase("es")}
                    </strong>
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
      <div className="dashboard-grid" style={{ marginTop: 18 }}>
        <section className="card">
          <div className="card-header">
            <h2>Próximas reuniones</h2>
            <Link className="table-action" href="/reuniones">
              Ver todas
            </Link>
          </div>
          <div className="compact-list">
            {meetings.slice(0, 3).map((meeting) => (
              <div className="compact-row" key={meeting.id}>
                <CalendarPlus size={18} aria-hidden="true" />
                <span>
                  <strong>{meeting.title}</strong>
                  <span>
                    {meeting.juntaName} ·{" "}
                    {new Intl.DateTimeFormat("es-CO", {
                      timeZone: "America/Bogota",
                      dateStyle: "medium",
                    }).format(new Date(meeting.startsAt))}
                  </span>
                </span>
                <StatusBadge status={meeting.status} />
              </div>
            ))}
          </div>
        </section>
        <section className="card">
          <div className="card-header">
            <h2>Actividades</h2>
            <Link className="table-action" href="/actividades">
              Ver todas
            </Link>
          </div>
          <div className="compact-list">
            {activities.slice(0, 3).map((activity) => (
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
