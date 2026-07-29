import Link from "next/link";

export function BrandMark({
  compact = false,
  linked = false,
}: {
  compact?: boolean;
  linked?: boolean;
}) {
  const mark = (
    <span className={`brand-mark ${compact ? "brand-mark-compact" : ""}`}>
      <span className="brand-monogram" aria-hidden="true">
        SJ
      </span>
      {!compact && (
        <span className="brand-wordmark">
          <strong>SIJAC</strong>
          <small>Aguadas</small>
        </span>
      )}
    </span>
  );
  return linked ? (
    <Link href="/panel" aria-label="Ir al panel de SIJAC">
      {mark}
    </Link>
  ) : (
    mark
  );
}
