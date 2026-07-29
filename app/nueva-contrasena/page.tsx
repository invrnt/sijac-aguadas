import { NewPasswordForm } from "@/components/NewPasswordForm";

export const metadata = { title: "Crear nueva contraseña" };

export default function NewPasswordPage() {
  return (
    <main id="contenido-principal" className="simple-auth-page">
      <section className="auth-card narrow-card">
        <p className="eyebrow">Acceso institucional</p>
        <h1>Crear nueva contraseña</h1>
        <p>Use al menos 10 caracteres y evite contraseñas reutilizadas.</p>
        <NewPasswordForm />
      </section>
    </main>
  );
}
