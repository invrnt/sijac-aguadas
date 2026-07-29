"use client";

import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

export function NewPasswordForm() {
  const params = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    if (password !== confirmation) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }
    const token = params.get("token");
    if (!token) {
      setMessage("El enlace no es válido o está incompleto.");
      return;
    }
    const result = await authClient.resetPassword({ newPassword: password, token });
    if (result.error) {
      setMessage("El enlace venció o ya fue utilizado.");
      return;
    }
    setDone(true);
  }

  if (done)
    return (
      <div className="success-panel">
        La contraseña fue actualizada. <a href="/iniciar-sesion">Iniciar sesión</a>
      </div>
    );
  return (
    <form className="stack-form" onSubmit={submit}>
      <label>
        <span>Nueva contraseña</span>
        <input name="password" type="password" minLength={10} required />
      </label>
      <label>
        <span>Confirmar contraseña</span>
        <input name="confirmation" type="password" minLength={10} required />
      </label>
      {message && <p className="form-message error-message">{message}</p>}
      <button className="button button-primary button-full">
        Guardar contraseña
      </button>
    </form>
  );
}
