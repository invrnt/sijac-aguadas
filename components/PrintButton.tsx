"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label = "Imprimir" }: { label?: string }) {
  return (
    <button
      type="button"
      className="button button-secondary"
      onClick={() => window.print()}
    >
      <Printer size={17} />
      {label}
    </button>
  );
}
