"use client";

import { useState, type FormEvent } from "react";
import { CalendarDays, MapPin, Plus, UserCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PrintButton } from "@/components/PrintButton";
import { StatusBadge } from "@/components/StatusBadge";
import type { MeetingItem } from "@/types";

type AgendaItem = { id: string; position: number; title: string };
type AttendanceItem = {
  id: string;
  fullName: string;
  documentNumber: string;
  roleOrRepresentation: string | null;
  status: string;
};

export function MeetingDetail({
  meeting,
  initialAgenda,
  initialAttendance,
  canEdit,
}: {
  meeting: MeetingItem;
  initialAgenda: AgendaItem[];
  initialAttendance: AttendanceItem[];
  canEdit: boolean;
}) {
  const [agenda, setAgenda] = useState(initialAgenda);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [form, setForm] = useState<"agenda" | "attendance" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>, kind: "agenda" | "attendance") {
    event.preventDefault();
    const payload = { kind, ...Object.fromEntries(new FormData(event.currentTarget)) };
    const response = await fetch(`/api/reuniones/${meeting.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error ?? "No fue posible guardar.");
      return;
    }
    if (kind === "agenda") setAgenda((current) => [...current, result.data]);
    else setAttendance((current) => [...current, result.data]);
    setForm(null);
    setMessage("Registro guardado correctamente.");
  }

  return (
    <>
      <PageHeader
        eyebrow={meeting.type}
        title={meeting.title}
        description={`${meeting.juntaName} · ${meeting.location}`}
        actions={<PrintButton label="Imprimir convocatoria" />}
      />
      <section className="stat-grid">
        <article className="stat-card">
          <CalendarDays size={22} />
          <div>
            <div className="stat-value" style={{ fontSize: "1.15rem" }}>
              {new Intl.DateTimeFormat("es-CO", {
                timeZone: "America/Bogota",
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(meeting.startsAt))}
            </div>
            <div className="stat-label">Fecha y hora</div>
          </div>
        </article>
        <article className="stat-card">
          <MapPin size={22} />
          <div>
            <div className="stat-value" style={{ fontSize: "1.15rem" }}>
              {meeting.location}
            </div>
            <div className="stat-label">Lugar</div>
          </div>
        </article>
        <article className="stat-card">
          <Users size={22} />
          <div>
            <div className="stat-value">{attendance.length}</div>
            <div className="stat-label">Asistentes registrados</div>
          </div>
        </article>
        <article className="stat-card">
          <UserCheck size={22} />
          <div>
            <StatusBadge status={meeting.status} />
            <div className="stat-label" style={{ marginTop: 15 }}>
              Estado de la reunión
            </div>
          </div>
        </article>
      </section>
      {message && <div className="toast">{message}</div>}
      <div className="dashboard-grid">
        <section className="card">
          <div className="card-header">
            <h2>Orden del día</h2>
            {canEdit && (
              <button
                className="button button-secondary button-small"
                onClick={() => setForm(form === "agenda" ? null : "agenda")}
              >
                <Plus size={15} /> Agregar punto
              </button>
            )}
          </div>
          {form === "agenda" && (
            <form className="inline-create form-grid" onSubmit={(event) => submit(event, "agenda")}>
              <label>
                <span>Orden</span>
                <input name="position" type="number" min="1" defaultValue={agenda.length + 1} />
              </label>
              <label>
                <span>Título</span>
                <input name="title" required />
              </label>
              <button className="button button-primary">Guardar punto</button>
            </form>
          )}
          <ol className="compact-list">
            {agenda.map((item) => (
              <li className="compact-row" key={item.id}>
                <span className="activity-icon">{item.position}</span>
                <strong>{item.title}</strong>
                <span />
              </li>
            ))}
          </ol>
        </section>
        <section className="card">
          <div className="card-header">
            <h2>Asistencia</h2>
            {canEdit && (
              <button
                className="button button-secondary button-small"
                onClick={() => setForm(form === "attendance" ? null : "attendance")}
              >
                <Plus size={15} /> Registrar
              </button>
            )}
          </div>
          {form === "attendance" && (
            <form
              className="inline-create form-grid"
              onSubmit={(event) => submit(event, "attendance")}
            >
              <label>
                <span>Nombre completo</span>
                <input name="fullName" required />
              </label>
              <label>
                <span>Documento</span>
                <input name="documentNumber" required />
              </label>
              <label>
                <span>Representación</span>
                <input name="roleOrRepresentation" />
              </label>
              <label>
                <span>Estado</span>
                <select name="status" defaultValue="asistio">
                  <option value="asistio">Asistió</option>
                  <option value="no_asistio">No asistió</option>
                  <option value="excusa">Presentó excusa</option>
                </select>
              </label>
              <button className="button button-primary">Guardar asistencia</button>
            </form>
          )}
          <div className="compact-list">
            {attendance.map((person) => (
              <div className="compact-row" key={person.id}>
                <UserCheck size={18} />
                <span>
                  <strong>{person.fullName}</strong>
                  <span>
                    {person.roleOrRepresentation || "Asistente"} · Doc.{" "}
                    {person.documentNumber}
                  </span>
                </span>
                <StatusBadge status={person.status} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
