import Link from "next/link";
import Image from "next/image";

export function BrandMark({
  compact = false,
  linked = false,
}: {
  compact?: boolean;
  linked?: boolean;
}) {
  const mark = (
    <span className={`brand-mark ${compact ? "brand-mark-compact" : ""}`}>
      <Image
        className="brand-logo"
        src={compact ? "/icon-192.png" : "/sijac-logo.png"}
        alt="SIJAC Aguadas"
        width={compact ? 44 : 224}
        height={compact ? 44 : 128}
        priority={!compact}
      />
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
