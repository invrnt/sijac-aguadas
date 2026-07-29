"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Plus,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import type {
  ActivityItem,
  CommitmentItem,
  JuntaSummary,
  MeetingItem,
  MinuteItem,
} from "@/types";

type Entity = "reuniones" | "actas" | "compromisos" | "actividades";
type RecordItem = MeetingItem | MinuteItem | CommitmentItem | ActivityItem;

const labels: Record<Entity, { singular: string; search: string }> = {
  reuniones: { singular: "reunión", search: "título, junta o lugar" },
  actas: { singular: "acta", search: "número, junta o contenido" },
  compromisos: { singular: "compromiso", search: "título, responsable o junta" },
  actividades: { singular: "actividad", search: "título, lugar o junta" },
};

export function OperationsManager({
  entity,
  items,
  juntas,
  meetings = [],
  canEdit,
  startOpen = false,
}: {
  entity: Entity;
  items: RecordItem[];
  juntas: JuntaSummary[];
  meetings?: MeetingItem[];
  canEdit: boolean;
  startOpen?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(startOpen);
  const [records, setRecords] = useState(items);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");
    return records.filter((item) => {
      const haystack = JSON.stringify(item).toLocaleLowerCase("es");
      return (
        (!normalized || haystack.includes(normalized)) &&
        (!status || item.status === status)
      );
    });
  }, [query, records, status]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const raw = Object.fromEntries(form);
    const payload =
      entity === "reuniones"
        ? {
            juntaId: raw.juntaId,
            title: raw.title,
            type: raw.type,
            startsAt: raw.date,
            location: raw.location,
            status: "borrador",
          }
        : entity === "actas"
          ? {
              meetingId: raw.meetingId,
              number: raw.number,
              year: raw.year,
              summary: raw.summary,
              status: "borrador",
            }
          : entity === "compromisos"
            ? {
                juntaId: raw.juntaId,
                title: raw.title,
                responsibleName: raw.responsibleName,
                dueDate: raw.date,
                status: "pendiente",
              }
            : {
                juntaId: raw.juntaId,
                title: raw.title,
                responsibleName: raw.responsibleName,
                startDate: raw.date,
                location: raw.location,
                beneficiariesCount: raw.beneficiariesCount,
                status: "planeada",
              };

    const response = await fetch(`/api/operaciones/${entity}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error ?? "No fue posible guardar el registro.");
      setSaving(false);
      return;
    }
    const junta = juntas.find((item) => item.id === raw.juntaId);
    setRecords((current) => [
      {
        ...result.data,
        juntaName: junta?.officialName ?? "JAC",
        attendanceCount: 0,
        progress: 0,
        beneficiariesCount: Number(raw.beneficiariesCount ?? 0),
        updatedAt: new Date().toISOString(),
        transient: Boolean(result.demo),
      } as RecordItem,
      ...current,
    ]);
    event.currentTarget.reset();
    setMessage(`${labels[entity].singular} registrada correctamente.`);
    setSaving(false);
    setOpen(false);
  }

  return (
    <>
      {canEdit && open && (
        <section className="inline-create" aria-labelledby="new-record-title">
          <div className="inline-create-header">
            <div>
              <h2 id="new-record-title">
                Registrar {labels[entity].singular}
              </h2>
              <p>Complete los datos mínimos. Podrá ampliar el registro después.</p>
            </div>
            <button
              className="icon-button"
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar formulario"
            >
              <X size={19} />
            </button>
          </div>
          <form className="form-grid" onSubmit={create}>
            {entity !== "actas" && (
              <label>
                <span>Junta de Acción Comunal *</span>
                <select name="juntaId" required defaultValue="">
                  <option value="" disabled>
                    Seleccione una junta
                  </option>
                  {juntas
                    .filter((junta) => junta.status !== "archivada")
                    .map((junta) => (
                      <option key={junta.id} value={junta.id}>
                        {junta.code} · {junta.officialName}
                      </option>
                    ))}
                </select>
              </label>
            )}
            {entity === "actas" ? (
              <>
                <label>
                  <span>Reunión *</span>
                  <select name="meetingId" required defaultValue="">
                    <option value="" disabled>
                      Seleccione una reunión finalizada
                    </option>
                    {meetings
                      .filter((meeting) => meeting.status === "finalizada")
                      .map((meeting) => (
                        <option key={meeting.id} value={meeting.id}>
                          {meeting.title} · {meeting.juntaName}
                        </option>
                      ))}
                  </select>
                </label>
                <label>
                  <span>Número de acta *</span>
                  <input name="number" required maxLength={30} placeholder="015" />
                </label>
                <label>
                  <span>Año *</span>
                  <input
                    name="year"
                    type="number"
                    min="2000"
                    max="2200"
                    defaultValue={new Date().getFullYear()}
                    required
                  />
                </label>
                <label className="full">
                  <span>Resumen inicial</span>
                  <textarea name="summary" maxLength={10000} />
                </label>
              </>
            ) : (
              <>
                <label>
                  <span>Título *</span>
                  <input name="title" required maxLength={220} />
                </label>
                {entity === "reuniones" && (
                  <label>
                    <span>Tipo de reunión *</span>
                    <select name="type" defaultValue="ordinaria">
                      <option value="ordinaria">Ordinaria</option>
                      <option value="extraordinaria">Extraordinaria</option>
                      <option value="directiva">Directiva</option>
                    </select>
                  </label>
                )}
                {(entity === "compromisos" || entity === "actividades") && (
                  <label>
                    <span>Responsable *</span>
                    <input name="responsibleName" required maxLength={180} />
                  </label>
                )}
                <label>
                  <span>
                    {entity === "reuniones"
                      ? "Fecha y hora"
                      : entity === "compromisos"
                        ? "Fecha límite"
                        : "Fecha de inicio"}{" "}
                    *
                  </span>
                  <input
                    name="date"
                    type={entity === "reuniones" ? "datetime-local" : "date"}
                    required
                  />
                </label>
                {(entity === "reuniones" || entity === "actividades") && (
                  <label>
                    <span>Lugar *</span>
                    <input name="location" required maxLength={240} />
                  </label>
                )}
                {entity === "actividades" && (
                  <label>
                    <span>Beneficiarios estimados</span>
                    <input
                      name="beneficiariesCount"
                      type="number"
                      min="0"
                      defaultValue="0"
                    />
                  </label>
                )}
              </>
            )}
            <div className="full page-actions">
              <button className="button button-primary" disabled={saving}>
                <Plus size={17} />
                {saving ? "Guardando…" : `Guardar ${labels[entity].singular}`}
              </button>
            </div>
          </form>
        </section>
      )}
      {message && (
        <div className={message.includes("correctamente") ? "toast" : "form-message error-message"} role="status">
          {message}
        </div>
      )}
      <div className="filter-bar" style={{ gridTemplateColumns: "1fr 190px auto" }}>
        <label className="search-field">
          <span className="sr-only">Buscar</span>
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Buscar por ${labels[entity].search}…`}
          />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Todos los estados</option>
          {Array.from(new Set(records.map((record) => record.status))).map((value) => (
            <option value={value} key={value}>
              {value.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        {canEdit && !open && (
          <button className="button button-primary" onClick={() => setOpen(true)}>
            <Plus size={17} />
            Registrar
          </button>
        )}
      </div>
      {filtered.length ? (
        <section className="record-grid" aria-label={`Listado de ${entity}`}>
          {filtered.map((item) => (
            <OperationCard key={item.id} item={item} entity={entity} />
          ))}
        </section>
      ) : (
        <section className="card">
          <EmptyState />
        </section>
      )}
    </>
  );
}

function OperationCard({ item, entity }: { item: RecordItem; entity: Entity }) {
  const isMeeting = entity === "reuniones";
  const isMinute = entity === "actas";
  const isCommitment = entity === "compromisos";
  const isTransient = Boolean(
    (item as RecordItem & { transient?: boolean }).transient,
  );
  const title = isMinute
    ? `Acta ${(item as MinuteItem).number} de ${(item as MinuteItem).year}`
    : (item as MeetingItem | CommitmentItem | ActivityItem).title;
  const juntaName = "juntaName" in item ? item.juntaName : "Junta asociada";
  const date = isMeeting
    ? (item as MeetingItem).startsAt
    : isMinute
      ? (item as MinuteItem).updatedAt
      : isCommitment
        ? (item as CommitmentItem).dueDate
        : (item as ActivityItem).startDate;

  return (
    <article className="record-card">
      <div className="record-card-header">
        <span className="activity-icon">
          {isMeeting ? (
            <CalendarDays size={18} />
          ) : isMinute ? (
            <CheckCircle2 size={18} />
          ) : isCommitment ? (
            <Clock3 size={18} />
          ) : (
            <MapPin size={18} />
          )}
        </span>
        <StatusBadge status={item.status} />
      </div>
      <h3>{title}</h3>
      <p>
        {isMinute
          ? (item as MinuteItem).summary
          : isCommitment
            ? `Responsable: ${(item as CommitmentItem).responsibleName}`
            : isMeeting
              ? (item as MeetingItem).location
              : (item as ActivityItem).location}
      </p>
      <div className="record-meta">
        <span>
          <UserRound size={14} />
          {juntaName}
        </span>
        <span>
          <CalendarDays size={14} />
          {new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(
            new Date(date),
          )}
        </span>
      </div>
      {(entity === "reuniones" || entity === "actas") && !isTransient && (
        <Link
          className="button button-secondary button-full"
          style={{ marginTop: 14 }}
          href={`/${entity}/${item.id}`}
        >
          Abrir {entity === "reuniones" ? "reunión" : "acta"}
        </Link>
      )}
    </article>
  );
}
