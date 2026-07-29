import { redirect } from "next/navigation";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { LoginForm } from "@/components/LoginForm";
import { demoEnabled } from "@/lib/env";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/panel");

  return (
    <main id="contenido-principal" className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <div className="auth-heading">
          <BrandMark />
          <p className="eyebrow">Acceso institucional</p>
          <h1 id="login-title">Bienvenido de nuevo</h1>
          <p>
            Ingrese con el usuario o correo asignado por la Oficina de
            Desarrollo Comunitario.
          </p>
        </div>
        <LoginForm demoEnabled={demoEnabled} />
        <footer className="auth-footer">
          <Link href="/privacidad">Aviso de tratamiento de datos</Link>
          <span>·</span>
          <Link href="/">Volver al inicio</Link>
        </footer>
      </section>
      <aside className="auth-visual" aria-label="Paisaje de Aguadas">
        <div>
          <p>Información que fortalece la participación</p>
          <span>68 juntas · un territorio · una memoria común</span>
        </div>
      </aside>
    </main>
  );
}
