"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("SIJAC view error", { digest: error.digest });
  }, [error]);

  return (
    <main className="simple-auth-page">
      <section className="card card-padded">
        <p className="eyebrow">No fue posible continuar</p>
        <h1>Ocurrió un error controlado</h1>
        <p>La información no fue modificada. Puede intentar cargar la vista nuevamente.</p>
        <button className="button button-primary" onClick={reset}>
          Reintentar
        </button>
      </section>
    </main>
  );
}
