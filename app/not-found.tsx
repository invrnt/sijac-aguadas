import Link from "next/link";

export default function NotFound() {
  return (
    <main className="simple-auth-page">
      <section className="card card-padded">
        <p className="eyebrow">404</p>
        <h1>Información no encontrada</h1>
        <p>El registro puede haber sido archivado o la dirección no es válida.</p>
        <Link className="button button-primary" href="/panel">
          Volver al panel
        </Link>
      </section>
    </main>
  );
}
