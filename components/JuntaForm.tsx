"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LoaderCircle, Save } from "lucide-react";
import type { JuntaSummary } from "@/types";

export function JuntaForm({ junta }: { junta?: JuntaSummary }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form);
    payload.affiliatesCount = String(Number(payload.affiliatesCount || 0));

    const response = await fetch(junta ? `/api/juntas/${junta.id}` : "/api/juntas", {
      method: junta ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "No fue posible guardar la información.");
      setLoading(false);
      return;
    }
    router.push(result.demo ? "/juntas" : `/juntas/${result.data.id}`);
    router.refresh();
  }

  return (
    <form className="form-page" onSubmit={submit}>
      <section className="card section-card">
        <div className="card-header">
          <h2>Identificación</h2>
        </div>
        <div className="card-body form-grid">
          <label>
            <span>Código de la junta *</span>
            <input name="code" required maxLength={30} defaultValue={junta?.code} />
            <small className="form-hint">Debe ser único entre juntas activas.</small>
          </label>
          <label>
            <span>Nombre oficial *</span>
            <input
              name="officialName"
              required
              maxLength={180}
              defaultValue={junta?.officialName}
            />
          </label>
          <label>
            <span>Vereda o barrio *</span>
            <input
              name="neighborhood"
              required
              maxLength={120}
              defaultValue={junta?.neighborhood}
            />
          </label>
          <label>
            <span>Clasificación *</span>
            <select name="zone" required defaultValue={junta?.zone ?? "rural"}>
              <option value="rural">Rural</option>
              <option value="urbana">Urbana</option>
            </select>
          </label>
          <label>
            <span>Número de afiliados</span>
            <input
              name="affiliatesCount"
              type="number"
              min="0"
              step="1"
              defaultValue={junta?.affiliatesCount ?? 0}
            />
          </label>
          <label>
            <span>Estado institucional *</span>
            <select name="status" required defaultValue={junta?.status ?? "activa"}>
              <option value="activa">Activa</option>
              <option value="inactiva">Inactiva</option>
              <option value="archivada">Archivada</option>
            </select>
          </label>
        </div>
      </section>
      <section className="card section-card">
        <div className="card-header">
          <h2>Información legal</h2>
        </div>
        <div className="card-body form-grid">
          <label>
            <span>NIT</span>
            <input name="nit" maxLength={40} defaultValue={junta?.nit ?? ""} />
          </label>
          <label>
            <span>Personería jurídica</span>
            <input
              name="legalEntityNumber"
              maxLength={80}
              defaultValue={junta?.legalEntityNumber ?? ""}
            />
          </label>
          <label>
            <span>Número o referencia de resolución</span>
            <input
              name="resolutionNumber"
              maxLength={80}
              defaultValue={junta?.resolutionNumber ?? ""}
            />
          </label>
          <label>
            <span>Fecha de reconocimiento</span>
            <input
              name="recognitionDate"
              type="date"
              defaultValue={junta?.recognitionDate ?? ""}
            />
          </label>
          <label className="full">
            <span>Entidad que reconoce</span>
            <input
              name="recognitionEntity"
              maxLength={180}
              defaultValue={junta?.recognitionEntity ?? ""}
            />
          </label>
        </div>
      </section>
      <section className="card section-card">
        <div className="card-header">
          <h2>Ubicación y contacto</h2>
        </div>
        <div className="card-body form-grid">
          <label>
            <span>Dirección</span>
            <input name="address" maxLength={250} defaultValue={junta?.address ?? ""} />
          </label>
          <label>
            <span>Teléfono</span>
            <input
              name="phone"
              type="tel"
              maxLength={40}
              defaultValue={junta?.phone ?? ""}
            />
          </label>
          <label>
            <span>Correo de contacto</span>
            <input
              name="email"
              type="email"
              maxLength={180}
              defaultValue={junta?.email ?? ""}
            />
          </label>
          <label>
            <span>Municipio</span>
            <input value="Aguadas" disabled />
          </label>
          <label className="full">
            <span>Referencia de ubicación</span>
            <textarea
              name="locationReference"
              maxLength={500}
              defaultValue={junta?.locationReference ?? ""}
            />
          </label>
        </div>
      </section>
      {error && (
        <p className="form-message error-message" role="alert">
          {error}
        </p>
      )}
      <div className="form-actions">
        <Link className="button button-ghost" href={junta ? `/juntas/${junta.id}` : "/juntas"}>
          Cancelar
        </Link>
        <button className="button button-primary" disabled={loading}>
          {loading ? <LoaderCircle className="spin" size={18} /> : <Save size={18} />}
          {loading ? "Guardando…" : "Guardar JAC"}
        </button>
      </div>
    </form>
  );
}
