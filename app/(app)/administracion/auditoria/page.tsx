import { Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PrintButton } from "@/components/PrintButton";
import { listAuditData } from "@/lib/queries";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Auditoría" };

export default async function AuditPage() {
  await requireAdmin();
  const audit = await listAuditData();
  return (
    <>
      <PageHeader
        eyebrow="Trazabilidad"
        title="Auditoría"
        description="Consulte operaciones sensibles por actor, acción, entidad y fecha. Los eventos no pueden editarse."
        actions={<PrintButton label="Imprimir auditoría" />}
      />
      <div className="filter-bar" style={{ gridTemplateColumns: "1fr 180px 180px" }}>
        <label className="search-field">
          <span className="sr-only">Buscar auditoría</span>
          <Search size={17} />
          <input placeholder="Actor, acción o recurso…" />
        </label>
        <input type="date" aria-label="Fecha inicial" />
        <input type="date" aria-label="Fecha final" />
      </div>
      <section className="card">
        {audit.map((event) => (
          <div className="audit-row" key={event.id}>
            <time dateTime={event.createdAt}>
              {new Intl.DateTimeFormat("es-CO", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(event.createdAt))}
            </time>
            <strong>{event.actor}</strong>
            <span>
              {event.action} <b>{event.resource}</b>
            </span>
            <span>{event.entity}</span>
          </div>
        ))}
      </section>
    </>
  );
}
