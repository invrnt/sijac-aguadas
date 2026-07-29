"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  Download,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Upload,
  Users,
} from "lucide-react";
import { PrintButton } from "@/components/PrintButton";
import { StatusBadge } from "@/components/StatusBadge";
import type { Convenio, Dignatario, JuntaSummary } from "@/types";

type FileRecord = {
  id: string;
  category: string;
  originalName: string;
  sizeBytes: number;
  createdAt: string;
};

export function JuntaDetail({
  junta,
  dignatarios,
  convenios,
  files,
  canEdit,
}: {
  junta: JuntaSummary;
  dignatarios: Dignatario[];
  convenios: Convenio[];
  files: FileRecord[];
  canEdit: boolean;
}) {
  const [tab, setTab] = useState("general");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [officers, setOfficers] = useState(dignatarios);
  const [agreements, setAgreements] = useState(convenios);
  const [showOfficerForm, setShowOfficerForm] = useState(false);
  const [showAgreementForm, setShowAgreementForm] = useState(false);
  const tabs = [
    ["general", "Información general"],
    ["dignatarios", "Dignatarios"],
    ["convenios", "Convenios"],
    ["documentos", "Documentos"],
  ];

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploading(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    form.set("juntaId", junta.id);
    const response = await fetch("/api/files", { method: "POST", body: form });
    const result = await response.json();
    setUploading(false);
    setMessage(
      response.ok
        ? "Archivo cargado correctamente."
        : result.error ?? "No fue posible cargar el archivo.",
    );
    if (response.ok) event.currentTarget.reset();
  }

  async function createOfficer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/dignatarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ juntaId: junta.id, ...Object.fromEntries(form) }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error ?? "No fue posible registrar el dignatario.");
      return;
    }
    setOfficers((current) => [...current, result.data]);
    setShowOfficerForm(false);
    setMessage("Dignatario registrado correctamente.");
  }

  async function createAgreement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/convenios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ juntaId: junta.id, ...Object.fromEntries(form) }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error ?? "No fue posible registrar el convenio.");
      return;
    }
    setAgreements((current) => [...current, result.data]);
    setShowAgreementForm(false);
    setMessage("Convenio registrado correctamente.");
  }

  return (
    <>
      <section className="detail-hero">
        <StatusBadge status={junta.status} />
        <p className="eyebrow" style={{ color: "#e2c797" }}>
          {junta.code} · Junta de Acción Comunal
        </p>
        <h1>{junta.officialName}</h1>
        <p>
          {junta.neighborhood} · {junta.zone} · Aguadas, Caldas
        </p>
      </section>
      <div className="page-actions" style={{ marginBottom: 18 }}>
        <PrintButton label="Imprimir ficha" />
        {canEdit && (
          <Link className="button button-primary" href={`/juntas/${junta.id}/editar`}>
            <Pencil size={17} />
            Editar información
          </Link>
        )}
      </div>
      <div className="detail-grid">
        <section className="card">
          <div className="detail-tabs" role="tablist" aria-label="Secciones de la ficha">
            {tabs.map(([value, label]) => (
              <button
                key={value}
                className={`detail-tab ${tab === value ? "detail-tab-active" : ""}`}
                onClick={() => setTab(value)}
                role="tab"
                aria-selected={tab === value}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="card-body">
            {tab === "general" && (
              <>
                <h2>Información institucional</h2>
                <dl className="definition-grid">
                  <div>
                    <dt>Código</dt>
                    <dd>{junta.code}</dd>
                  </div>
                  <div>
                    <dt>Nombre oficial</dt>
                    <dd>{junta.officialName}</dd>
                  </div>
                  <div>
                    <dt>NIT</dt>
                    <dd>{junta.nit || "Pendiente"}</dd>
                  </div>
                  <div>
                    <dt>Personería jurídica</dt>
                    <dd>{junta.legalEntityNumber || "Pendiente"}</dd>
                  </div>
                  <div>
                    <dt>Resolución</dt>
                    <dd>{junta.resolutionNumber || "No registrada"}</dd>
                  </div>
                  <div>
                    <dt>Fecha de reconocimiento</dt>
                    <dd>
                      {junta.recognitionDate
                        ? new Intl.DateTimeFormat("es-CO", {
                            dateStyle: "long",
                          }).format(new Date(`${junta.recognitionDate}T12:00:00`))
                        : "No registrada"}
                    </dd>
                  </div>
                  <div>
                    <dt>Entidad que reconoce</dt>
                    <dd>{junta.recognitionEntity || "No registrada"}</dd>
                  </div>
                  <div>
                    <dt>Número de afiliados</dt>
                    <dd>{junta.affiliatesCount}</dd>
                  </div>
                  <div>
                    <dt>Dirección</dt>
                    <dd>{junta.address || "No registrada"}</dd>
                  </div>
                  <div>
                    <dt>Teléfono</dt>
                    <dd>{junta.phone || "No registrado"}</dd>
                  </div>
                  <div>
                    <dt>Correo</dt>
                    <dd>{junta.email || "No registrado"}</dd>
                  </div>
                  <div>
                    <dt>Referencia de ubicación</dt>
                    <dd>{junta.locationReference || "No registrada"}</dd>
                  </div>
                </dl>
              </>
            )}
            {tab === "dignatarios" && (
              <>
                <div className="card-header" style={{ padding: "0 0 16px" }}>
                  <h2>Dignatarios vigentes</h2>
                  {canEdit && (
                    <button
                      className="button button-secondary button-small"
                      onClick={() => setShowOfficerForm((value) => !value)}
                    >
                      <Plus size={15} /> Registrar
                    </button>
                  )}
                </div>
                {showOfficerForm && (
                  <form className="inline-create form-grid" onSubmit={createOfficer}>
                    <label>
                      <span>Cargo</span>
                      <select name="position">
                        <option>Presidente</option>
                        <option>Vicepresidente</option>
                        <option>Secretario</option>
                        <option>Tesorero</option>
                        <option>Fiscal</option>
                      </select>
                    </label>
                    <label>
                      <span>Nombre completo</span>
                      <input name="fullName" required />
                    </label>
                    <label>
                      <span>Documento</span>
                      <input name="documentNumber" required />
                    </label>
                    <label>
                      <span>Teléfono</span>
                      <input name="phone" type="tel" />
                    </label>
                    <label>
                      <span>Inicio del periodo</span>
                      <input name="termStart" type="date" />
                    </label>
                    <label>
                      <span>Fin del periodo</span>
                      <input name="termEnd" type="date" />
                    </label>
                    <button className="button button-primary">Guardar dignatario</button>
                  </form>
                )}
                {officers.length ? (
                  officers.map((officer) => (
                    <div className="officer-row" key={officer.id}>
                      <span>
                        <strong>{officer.fullName}</strong>
                        <span>
                          {officer.position} · Doc. {officer.documentNumber} ·{" "}
                          {officer.phone}
                        </span>
                      </span>
                      <StatusBadge status={officer.isCurrent ? "vigente" : "finalizado"} />
                    </div>
                  ))
                ) : (
                  <p className="lead">No hay dignatarios registrados.</p>
                )}
              </>
            )}
            {tab === "convenios" && (
              <>
                <div className="card-header" style={{ padding: "0 0 16px" }}>
                  <h2>Convenios asociados</h2>
                  {canEdit && (
                    <button
                      className="button button-secondary button-small"
                      onClick={() => setShowAgreementForm((value) => !value)}
                    >
                      <Plus size={15} /> Registrar
                    </button>
                  )}
                </div>
                {showAgreementForm && (
                  <form className="inline-create form-grid" onSubmit={createAgreement}>
                    <label>
                      <span>Número</span>
                      <input name="number" required />
                    </label>
                    <label>
                      <span>Año</span>
                      <input
                        name="year"
                        type="number"
                        min="1950"
                        max="2200"
                        defaultValue={new Date().getFullYear()}
                        required
                      />
                    </label>
                    <label className="full">
                      <span>Descripción</span>
                      <textarea name="description" required />
                    </label>
                    <label>
                      <span>Estado</span>
                      <select name="status" defaultValue="pendiente">
                        <option value="pendiente">Pendiente</option>
                        <option value="vigente">Vigente</option>
                        <option value="suspendido">Suspendido</option>
                        <option value="finalizado">Finalizado</option>
                      </select>
                    </label>
                    <label>
                      <span>Valor</span>
                      <input name="value" type="number" min="0" step="1000" />
                    </label>
                    <button className="button button-primary">Guardar convenio</button>
                  </form>
                )}
                {agreements.map((agreement) => (
                  <div className="officer-row" key={agreement.id}>
                    <span>
                      <strong>
                        Convenio {agreement.number} de {agreement.year}
                      </strong>
                      <span>
                        {agreement.description}
                        {agreement.value
                          ? ` · ${new Intl.NumberFormat("es-CO", {
                              style: "currency",
                              currency: "COP",
                              maximumFractionDigits: 0,
                            }).format(agreement.value)}`
                          : ""}
                      </span>
                    </span>
                    <StatusBadge status={agreement.status} />
                  </div>
                ))}
              </>
            )}
            {tab === "documentos" && (
              <>
                <h2>Fotografías y documentos</h2>
                {canEdit && (
                  <form className="inline-create" onSubmit={upload}>
                    <div className="form-grid">
                      <label>
                        <span>Categoría</span>
                        <select name="category" defaultValue="Otro">
                          <option>Personería jurídica</option>
                          <option>Convenio</option>
                          <option>Acta de elección</option>
                          <option>Fotografía</option>
                          <option>Otro</option>
                        </select>
                      </label>
                      <label>
                        <span>Archivo (máximo 10 MB)</span>
                        <input
                          name="file"
                          type="file"
                          required
                          accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.xlsx"
                        />
                      </label>
                      <label className="full">
                        <span>Descripción</span>
                        <input name="description" maxLength={500} />
                      </label>
                    </div>
                    <button
                      className="button button-primary"
                      disabled={uploading}
                      style={{ marginTop: 14 }}
                    >
                      <Upload size={16} />
                      {uploading ? "Cargando…" : "Cargar archivo"}
                    </button>
                    {message && <p className="form-message">{message}</p>}
                  </form>
                )}
                {files.map((file) => (
                  <div className="document-row" key={file.id}>
                    <span>
                      <strong>{file.originalName}</strong>
                      <span>
                        {file.category} · {(file.sizeBytes / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </span>
                    <a
                      className="button button-ghost button-small"
                      href={`/api/files/${file.id}`}
                      aria-label={`Descargar ${file.originalName}`}
                    >
                      <Download size={16} />
                    </a>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>
        <aside className="detail-side">
          <section className="card card-padded">
            <h2>Resumen</h2>
            <dl className="summary-list">
              <div>
                <dt>Completitud</dt>
                <dd>{junta.completeness}%</dd>
              </div>
              <div>
                <dt>Dignatarios</dt>
                <dd>{officers.length} vigentes</dd>
              </div>
              <div>
                <dt>Convenios</dt>
                <dd>{agreements.length} registrados</dd>
              </div>
              <div>
                <dt>Documentos</dt>
                <dd>{files.length} archivos</dd>
              </div>
              <div>
                <dt>Actualizada</dt>
                <dd>
                  {new Intl.DateTimeFormat("es-CO", {
                    dateStyle: "medium",
                  }).format(new Date(junta.updatedAt))}
                </dd>
              </div>
            </dl>
          </section>
          <section className="card card-padded">
            <h2>Contacto rápido</h2>
            <div className="summary-list">
              <div>
                <dt>
                  <MapPin size={15} /> Ubicación
                </dt>
                <dd>{junta.neighborhood}</dd>
              </div>
              <div>
                <dt>
                  <Phone size={15} /> Teléfono
                </dt>
                <dd>{junta.phone || "Pendiente"}</dd>
              </div>
              <div>
                <dt>
                  <Users size={15} /> Afiliados
                </dt>
                <dd>{junta.affiliatesCount}</dd>
              </div>
            </div>
          </section>
        </aside>
      </div>
      {message && (
        <div className="toast" role="status">
          {message}
        </div>
      )}
    </>
  );
}
