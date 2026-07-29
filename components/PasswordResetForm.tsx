"use client";

import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

export function PasswordResetForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    await authClient.requestPasswordReset({
      email: String(form.get("email") ?? ""),
      redirectTo: "/nueva-contrasena",
    });
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="success-panel" role="status">
        Revise su correo. Si existe una cuenta asociada, recibirá instrucciones
        en los próximos minutos.
      </div>
    );
  }
  return (
    <form className="stack-form" onSubmit={submit}>
      <label>
        <span>Correo electrónico</span>
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <button className="button button-primary button-full" disabled={loading}>
        {loading ? "Enviando…" : "Enviar instrucciones"}
      </button>
    </form>
  );
}
