import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { getCurrentUser } from "@/lib/session";

export default async function WelcomePage() {
  const user = await getCurrentUser();

  return (
    <main id="contenido-principal" className="welcome-page">
      <section className="welcome-copy" aria-labelledby="welcome-title">
        <div>
          <div className="welcome-brand">
            <BrandMark />
            <span>Alcaldía de Aguadas</span>
          </div>
          <p className="eyebrow">Gestión comunitaria</p>
          <h1 id="welcome-title">SIJAC AGUADAS</h1>
          <p className="welcome-subtitle">
            Sistema de Información de Juntas de Acción Comunal
          </p>
          <p className="welcome-description">
            Información institucional, seguimiento y memoria comunitaria de las
            68 Juntas de Acción Comunal del municipio.
          </p>
          <Link
            className="button button-primary button-large"
            href={user ? "/panel" : "/iniciar-sesion"}
          >
            {user ? "Ir al panel" : "Iniciar sesión"}
            <ArrowRight size={19} aria-hidden="true" />
          </Link>
        </div>
        <div className="institutional-note">
          <LockKeyhole size={17} aria-hidden="true" />
          <span>Acceso exclusivo para personal autorizado</span>
        </div>
      </section>
      <figure className="welcome-image">
        <Image
          src="/hero-aguadas.webp"
          alt="Fuente y templo de la plaza principal de Aguadas, Caldas"
          fill
          priority
          sizes="(max-width: 800px) 100vw, 55vw"
        />
        <figcaption>La ciudad de las brumas · Aguadas, Caldas</figcaption>
      </figure>
    </main>
  );
}
