"use client";

import {
  CalendarRange,
  ClipboardList,
  Download,
  FileSpreadsheet,
  Landmark,
  Printer,
  UsersRound,
} from "lucide-react";
import type { ActivityItem, CommitmentItem, JuntaSummary } from "@/types";

const reports = [
  {
    title: "Directorio de JAC",
    description:
      "Código, nombre, ubicación, estado y datos de contacto autorizados.",
    icon: Landmark,
    type: "juntas",
  },
  {
    title: "Dignatarios vigentes",
    description:
      "Relación de cargos actuales con política de documento enmascarado.",
    icon: UsersRound,
    type: "dignatarios",
  },
  {
    title: "Compromisos abiertos",
    description: "Responsables, fechas límite, estados y porcentaje de avance.",
    icon: ClipboardList,
    type: "compromisos",
  },
  {
    title: "Actividades comunitarias",
    description: "Programación, estado, lugar y beneficiarios reportados.",
    icon: CalendarRange,
    type: "actividades",
  },
  {
    title: "Calidad de información",
    description: "Campos pendientes y nivel de completitud por ficha.",
    icon: FileSpreadsheet,
    type: "calidad",
  },
];

function createCsv(
  type: string,
  juntas: JuntaSummary[],
  commitments: CommitmentItem[],
  activities: ActivityItem[],
) {
  let headers: string[] = [];
  let rows: (string | number)[][] = [];
  if (type === "juntas" || type === "calidad") {
    headers = ["Código", "Nombre", "Lugar", "Zona", "Estado", "Completitud"];
    rows = juntas.map((item) => [
      item.code,
      item.officialName,
      item.neighborhood,
      item.zone,
      item.status,
      `${item.completeness}%`,
    ]);
  } else if (type === "compromisos") {
    headers = ["Junta", "Compromiso", "Responsable", "Fecha límite", "Estado"];
    rows = commitments.map((item) => [
      item.juntaName,
      item.title,
      item.responsibleName,
      item.dueDate,
      item.status,
    ]);
  } else if (type === "actividades") {
    headers = ["Junta", "Actividad", "Fecha", "Lugar", "Estado", "Beneficiarios"];
    rows = activities.map((item) => [
      item.juntaName,
      item.title,
      item.startDate,
      item.location,
      item.status,
      item.beneficiariesCount,
    ]);
  } else {
    headers = ["Cargo", "Nombre", "Documento", "Periodo"];
    rows = [
      ["Presidente", "Dato restringido", "••••", "2024–2028"],
      ["Secretario", "Dato restringido", "••••", "2024–2028"],
    ];
  }
  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `sijac-${type}-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ReportsClient({
  juntas,
  commitments,
  activities,
}: {
  juntas: JuntaSummary[];
  commitments: CommitmentItem[];
  activities: ActivityItem[];
}) {
  return (
    <section className="report-grid">
      {reports.map((report) => (
        <article className="report-card" key={report.type}>
          <span className="report-icon">
            <report.icon size={21} aria-hidden="true" />
          </span>
          <h2>{report.title}</h2>
          <p>{report.description}</p>
          <div className="page-actions">
            <button
              className="button button-secondary button-small"
              onClick={() =>
                createCsv(report.type, juntas, commitments, activities)
              }
            >
              <Download size={15} />
              CSV
            </button>
            <button
              className="button button-primary button-small"
              onClick={() => window.print()}
            >
              <Printer size={15} />
              Imprimir
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
