"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, Search, SlidersHorizontal } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import type { JuntaSummary } from "@/types";

function downloadCsv(rows: JuntaSummary[]) {
  const headers = [
    "Código",
    "Nombre",
    "Vereda/Barrio",
    "Zona",
    "Estado",
    "NIT",
    "Personería",
    "Afiliados",
  ];
  const values = rows.map((item) => [
    item.code,
    item.officialName,
    item.neighborhood,
    item.zone,
    item.status,
    item.nit ?? "",
    item.legalEntityNumber ?? "",
    item.affiliatesCount,
  ]);
  const csv = [headers, ...values]
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `juntas-sijac-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function JuntasClient({ juntas }: { juntas: JuntaSummary[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [zone, setZone] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");
    return juntas.filter((junta) => {
      const matches =
        !normalized ||
        [
          junta.code,
          junta.officialName,
          junta.neighborhood,
          junta.nit,
          junta.legalEntityNumber,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLocaleLowerCase("es").includes(normalized),
          );
      return (
        matches &&
        (!status || junta.status === status) &&
        (!zone || junta.zone === zone)
      );
    });
  }, [juntas, query, status, zone]);

  return (
    <>
      <div className="filter-bar" role="search">
        <label className="search-field">
          <span className="sr-only">Buscar juntas</span>
          <Search size={17} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Código, nombre, NIT, personería o lugar…"
          />
        </label>
        <label>
          <span className="sr-only">Filtrar por estado</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Todos los estados</option>
            <option value="activa">Activas</option>
            <option value="inactiva">Inactivas</option>
            <option value="archivada">Archivadas</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Filtrar por zona</span>
          <select value={zone} onChange={(event) => setZone(event.target.value)}>
            <option value="">Todas las zonas</option>
            <option value="urbana">Urbana</option>
            <option value="rural">Rural</option>
          </select>
        </label>
        <button
          className="button button-secondary"
          type="button"
          onClick={() => {
            setQuery("");
            setStatus("");
            setZone("");
          }}
        >
          <SlidersHorizontal size={16} />
          Limpiar
        </button>
      </div>
      <div className="results-summary" aria-live="polite">
        <span>
          {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
        </span>
        <button
          className="button button-ghost button-small"
          onClick={() => downloadCsv(filtered)}
          type="button"
          disabled={!filtered.length}
        >
          <Download size={15} />
          Exportar CSV
        </button>
      </div>
      <section className="card" aria-label="Listado de juntas">
        {filtered.length ? (
          <>
            <table className="data-table desktop-table">
              <thead>
                <tr>
                  <th>Junta</th>
                  <th>Ubicación</th>
                  <th>Zona</th>
                  <th>Afiliados</th>
                  <th>Completitud</th>
                  <th>Estado</th>
                  <th>
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((junta) => (
                  <tr key={junta.id}>
                    <td>
                      <span className="cell-title">{junta.officialName}</span>
                      <span className="cell-subtitle">
                        {junta.code} · {junta.nit || "NIT pendiente"}
                      </span>
                    </td>
                    <td>
                      <span className="cell-title">{junta.neighborhood}</span>
                      <span className="cell-subtitle">Aguadas, Caldas</span>
                    </td>
                    <td style={{ textTransform: "capitalize" }}>{junta.zone}</td>
                    <td>{junta.affiliatesCount}</td>
                    <td>
                      <div className="completion">
                        <span className="progress-track" aria-hidden="true">
                          <span
                            className="progress-fill"
                            style={{ width: `${junta.completeness}%` }}
                          />
                        </span>
                        <span>{junta.completeness}%</span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={junta.status} />
                    </td>
                    <td>
                      <Link className="table-action" href={`/juntas/${junta.id}`}>
                        Ver ficha
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="responsive-cards">
              {filtered.map((junta) => (
                <article className="entity-card" key={junta.id}>
                  <div className="entity-card-header">
                    <div>
                      <h3>{junta.officialName}</h3>
                      <span className="cell-subtitle">{junta.code}</span>
                    </div>
                    <StatusBadge status={junta.status} />
                  </div>
                  <dl>
                    <div>
                      <dt>Vereda o barrio</dt>
                      <dd>{junta.neighborhood}</dd>
                    </div>
                    <div>
                      <dt>Zona</dt>
                      <dd style={{ textTransform: "capitalize" }}>{junta.zone}</dd>
                    </div>
                    <div>
                      <dt>Afiliados</dt>
                      <dd>{junta.affiliatesCount}</dd>
                    </div>
                    <div>
                      <dt>Completitud</dt>
                      <dd>{junta.completeness}%</dd>
                    </div>
                  </dl>
                  <Link
                    className="button button-secondary button-full"
                    href={`/juntas/${junta.id}`}
                  >
                    Ver ficha completa
                  </Link>
                </article>
              ))}
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </section>
    </>
  );
}
