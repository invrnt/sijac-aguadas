import { SearchX } from "lucide-react";

export function EmptyState({
  title = "No encontramos resultados",
  description = "Pruebe con otros términos o limpie los filtros aplicados.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="empty-state">
      <div>
        <SearchX size={36} strokeWidth={1.6} />
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}
