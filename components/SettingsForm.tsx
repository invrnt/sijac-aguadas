"use client";

import { useState, type FormEvent } from "react";
import { Save } from "lucide-react";

export function SettingsForm() {
  const [saved, setSaved] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entityName: form.get("entityName"),
        officeName: form.get("officeName"),
        identityVisibility: form.get("identityVisibility"),
        maxFileSize: form.get("maxFileSize"),
        documentTypes: form.get("documentTypes"),
      }),
    });
    setSaved(response.ok);
    window.setTimeout(() => setSaved(false), 3500);
  }

  return (
    <form className="form-page" onSubmit={submit}>
      <section className="card section-card">
        <div className="card-header">
          <h2>Identidad institucional</h2>
        </div>
        <div className="card-body form-grid">
          <label>
            <span>Nombre de la entidad</span>
            <input name="entityName" defaultValue="Alcaldía de Aguadas" />
          </label>
          <label>
            <span>Oficina responsable</span>
            <input
              name="officeName"
              defaultValue="Oficina de Desarrollo Comunitario"
            />
          </label>
          <label className="full">
            <span>Logo institucional</span>
            <input name="logo" type="file" accept=".png,.jpg,.jpeg,.webp" />
            <small className="form-hint">
              Use el archivo oficial en formato PNG o WebP.
            </small>
          </label>
        </div>
      </section>
      <section className="card section-card">
        <div className="card-header">
          <h2>Privacidad y archivos</h2>
        </div>
        <div className="card-body form-grid">
          <label>
            <span>Visibilidad del documento de identidad</span>
            <select name="identityVisibility" defaultValue="masked">
              <option value="masked">Enmascarado para Consulta</option>
              <option value="admin">Solo Administrador</option>
              <option value="full">Completo para roles internos</option>
            </select>
          </label>
          <label>
            <span>Límite por archivo</span>
            <select name="maxFileSize" defaultValue="10">
              <option value="5">5 MB</option>
              <option value="10">10 MB</option>
              <option value="20">20 MB</option>
            </select>
          </label>
          <label className="full">
            <span>Tipos de documento permitidos</span>
            <input
              name="documentTypes"
              defaultValue="Personería jurídica, Convenio, Acta, Elección, Fotografía, Otro"
            />
          </label>
        </div>
      </section>
      {saved && (
        <div className="toast" role="status">
          Configuración guardada. En producción el cambio quedará auditado.
        </div>
      )}
      <div className="form-actions">
        <button className="button button-primary">
          <Save size={17} />
          Guardar configuración
        </button>
      </div>
    </form>
  );
}
