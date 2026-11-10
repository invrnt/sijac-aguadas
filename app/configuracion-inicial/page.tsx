import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { SetupWizard } from "@/components/SetupWizard";
import { demoEnabled } from "@/lib/env";
import { getSetupChecks, isInstalled } from "@/lib/setup";

export const metadata = { title: "Configuración inicial" };
export const dynamic = "force-dynamic";

export default async function InitialSetupPage() {
  const installed = !demoEnabled && (await isInstalled());

  return (
    <main id="contenido-principal" className="simple-auth-page">
      <section className="auth-card narrow-card setup-card">
        <BrandMark />
        <p className="eyebrow">Configuración inicial</p>
        {demoEnabled ? (
          <>
            <h1>Modo demostración</h1>
            <p>
              El asistente solo funciona con la base de datos real. Desactive
              DEMO_MODE para usarlo.
            </p>
            <Link className="text-link form-link" href="/iniciar-sesion">
              Ir a iniciar sesión
            </Link>
          </>
        ) : installed ? (
          <>
            <h1>La instalación está completa</h1>
            <p>
              Ya existe una cuenta de administrador. Las demás cuentas se crean
              desde el módulo Usuarios después de iniciar sesión.
            </p>
            <Link
              className="button button-primary button-full"
              href="/iniciar-sesion"
            >
              Iniciar sesión
            </Link>
          </>
        ) : (
          <SetupWizard checks={await getSetupChecks()} />
        )}
      </section>
    </main>
  );
}
