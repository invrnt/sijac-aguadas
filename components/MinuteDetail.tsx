"use client";

import { useState, type FormEvent } from "react";
import { Download, Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PrintButton } from "@/components/PrintButton";
import { StatusBadge } from "@/components/StatusBadge";
import type { MeetingItem, MinuteItem } from "@/types";

type Section = { id: string; position: number; heading: string; content: string };
type Decision = { id: string; description: string; result: string | null };

export function MinuteDetail({
  minute,
  meeting,
  initialSections,
  initialDecisions,
  canEdit,
}: {
  minute: MinuteItem;
  meeting: MeetingItem;
  initialSections: Section[];
  initialDecisions: Decision[];
  canEdit: boolean;
}) {
  const [sections, setSections] = useState(initialSections);
  const [decisions, setDecisions] = useState(initialDecisions);
  const [form, setForm] = useState<"section" | "decision" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>, kind: "section" | "decision") {
    event.preventDefault();
    const response = await fetch(`/api/actas/${minute.id}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, ...Object.fromEntries(new FormData(event.currentTarget)) }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error ?? "No fue posible guardar.");
      return;
    }
    if (kind === "section") setSections((current) => [...current, result.data]);
    else setDecisions((current) => [...current, result.data]);
    setForm(null);
    setMessage("Contenido guardado correctamente.");
  }

  return (
    <>
      <PageHeader
        eyebrow={`${minute.juntaName} · ${minute.year}`}
        title={`Acta ${minute.number}`}
        description={`${meeting.title} · ${meeting.location}`}
        actions={
          <>
            <PrintButton label="Imprimir acta" />
            <a className="button button-primary" href={`/api/actas/${minute.id}/pdf`}>
              <Download size={17} />
              Descargar PDF
            </a>
          </>
        }
      />
      <section className="detail-hero">
        <StatusBadge status={minute.status} />
        <h1>Acta {minute.number} de {minute.year}</h1>
        <p>{minute.summary || "Sin resumen registrado."}</p>
      </section>
      {message && <div className="toast">{message}</div>}
      <div className="dashboard-grid">
        <section className="card">
          <div className="card-header">
            <h2>Desarrollo del acta</h2>
            {canEdit && (
              <button className="button button-secondary button-small" onClick={() => setForm("section")}>
                <Plus size={15} /> Agregar sección
              </button>
            )}
          </div>
          {form === "section" && (
            <form className="inline-create form-grid" onSubmit={(event) => submit(event, "section")}>
              <label>
                <span>Orden</span>
                <input name="position" type="number" min="1" defaultValue={sections.length + 1} />
              </label>
              <label>
                <span>Encabezado</span>
                <input name="heading" required />
              </label>
              <label className="full">
                <span>Contenido</span>
                <textarea name="content" required />
              </label>
              <button className="button button-primary">Guardar sección</button>
            </form>
          )}
          <div className="card-body">
            {sections.map((section) => (
              <article key={section.id} style={{ marginBottom: 28 }}>
                <h3>{section.position}. {section.heading}</h3>
                <p>{section.content}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="card">
          <div className="card-header">
            <h2>Decisiones</h2>
            {canEdit && (
              <button className="button button-secondary button-small" onClick={() => setForm("decision")}>
                <Plus size={15} /> Agregar
              </button>
            )}
          </div>
          {form === "decision" && (
            <form className="inline-create form-grid" onSubmit={(event) => submit(event, "decision")}>
              <label className="full">
                <span>Decisión</span>
                <textarea name="description" required />
              </label>
              <label>
                <span>Resultado</span>
                <input name="result" placeholder="Aprobada por mayoría" />
              </label>
              <button className="button button-primary">Guardar decisión</button>
            </form>
          )}
          <div className="compact-list">
            {decisions.map((decision, index) => (
              <div className="compact-row" key={decision.id}>
                <span className="activity-icon">{index + 1}</span>
                <span>
                  <strong>{decision.description}</strong>
                  <span>{decision.result || "Sin resultado registrado"}</span>
                </span>
                <span />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
