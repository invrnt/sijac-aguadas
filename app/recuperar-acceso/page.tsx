import { BrandMark } from "@/components/BrandMark";
import { PasswordResetForm } from "@/components/PasswordResetForm";

export const metadata = { title: "Recuperar acceso" };

export default function PasswordResetPage() {
  return (
    <main id="contenido-principal" className="simple-auth-page">
      <section className="auth-card narrow-card">
        <BrandMark />
        <p className="eyebrow">Recuperación segura</p>
        <h1>Recuperar acceso</h1>
        <p>
          Si la cuenta existe, enviaremos un enlace temporal al correo
          registrado.
        </p>
        <PasswordResetForm />
        <a className="text-link form-link" href="/iniciar-sesion">
          Volver a iniciar sesión
        </a>
      </section>
    </main>
  );
}
