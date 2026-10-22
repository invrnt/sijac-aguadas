"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function LoginForm({ demoEnabled }: { demoEnabled: boolean }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const identifier = String(form.get("identifier") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const isEmail = identifier.includes("@");

    const result = isEmail
      ? await authClient.signIn.email({
          email: identifier,
          password,
          callbackURL: "/panel",
        })
      : await authClient.signIn.username({
          username: identifier,
          password,
          callbackURL: "/panel",
        });

    if (result.error) {
      setMessage("No fue posible iniciar sesión. Revise sus datos e intente de nuevo.");
      setLoading(false);
      return;
    }
    router.push("/panel");
    router.refresh();
  }

  async function loginDemo(role: "admin" | "consulta") {
    setLoading(true);
    const response = await fetch("/api/demo-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!response.ok) {
      setMessage("El modo demostración no está disponible.");
      setLoading(false);
      return;
    }
    router.push("/panel");
    router.refresh();
  }

  return (
    <>
      <form className="stack-form" onSubmit={onSubmit}>
        <label>
          <span>Usuario o correo electrónico</span>
          <input
            name="identifier"
            autoComplete="username"
            required
            placeholder="nombre.usuario"
          />
        </label>
        <label>
          <span>Contraseña</span>
          <span className="password-field">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              minLength={10}
              placeholder="Su contraseña"
            />
            <button
              type="button"
              className="icon-button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>
        {message && (
          <p className="form-message error-message" role="alert">
            {message}
          </p>
        )}
        <button className="button button-primary button-full" disabled={loading}>
          {loading ? (
            <>
              <LoaderCircle className="spin" size={18} />
              Ingresando…
            </>
          ) : (
            "Iniciar sesión"
          )}
        </button>
        <a className="text-link form-link" href="/recuperar-acceso">
          ¿Olvidó su contraseña?
        </a>
      </form>
      {demoEnabled && (
        <div className="demo-access">
          <div className="divider">
            <span>Vista previa local</span>
          </div>
          <p>
            Pruebe la aplicación con información ficticia. Ningún dato se
            guardará en la base de datos.
          </p>
          <div className="demo-buttons">
            <button
              className="button button-secondary"
              onClick={() => loginDemo("admin")}
              disabled={loading}
            >
              <ShieldCheck size={17} />
              Entrar como administrador
            </button>
            <button
              className="button button-ghost"
              onClick={() => loginDemo("consulta")}
              disabled={loading}
            >
              Entrar como consulta
            </button>
          </div>
        </div>
      )}
    </>
  );
}
