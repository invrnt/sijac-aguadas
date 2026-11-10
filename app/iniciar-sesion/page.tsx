import { redirect } from "next/navigation";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { LoginForm } from "@/components/LoginForm";
import { demoEnabled, hasDatabase } from "@/lib/env";
import { getCurrentUser } from "@/lib/session";
import { isInstalled } from "@/lib/setup";

export const metadata = { title: "Iniciar sesión" };
// Consulta D1 en cada visita para saber si falta la configuración inicial.
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // Una instalación nueva no tiene cuentas: se guía al asistente.
  if (hasDatabase && !(await isInstalled())) redirect("/configuracion-inicial");
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
