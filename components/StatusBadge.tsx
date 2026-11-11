import { clsx } from "clsx";
import { statusLabel } from "@/lib/labels";

const green = new Set([
  "activa",
  "vigente",
  "finalizada",
  "cerrada",
  "completado",
  "completada",
  "aprobada",
  "finalizado",
  "activo",
  "asistio",
]);
const amber = new Set([
  "pendiente",
  "borrador",
  "convocada",
  "en_revision",
  "aplazada",
  "excusa",
]);
const red = new Set(["archivada", "cancelada", "cancelado", "anulada", "bloqueado", "no_asistio"]);
const blue = new Set(["en_curso", "en_ejecucion", "suspendido", "planeada"]);

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  return (
    <span
      className={clsx(
        "status-badge",
        green.has(normalized) && "status-green",
        amber.has(normalized) && "status-amber",
        red.has(normalized) && "status-red",
        blue.has(normalized) && "status-blue",
        !green.has(normalized) &&
          !amber.has(normalized) &&
          !red.has(normalized) &&
          !blue.has(normalized) &&
          "status-gray",
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
