"use client";

import { useState, type FormEvent } from "react";
import {
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  ExternalLink,
  Eye,
  EyeOff,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import type { SetupCheck } from "@/lib/setup";

const CLOUDFLARE_WORKERS_URL =
  "https://dash.cloudflare.com/?to=/:account/workers-and-pages";

type Step = "review" | "account" | "done";

const stepLabels: Record<Step, string> = {
  review: "Revisión",
  account: "Administrador",
  done: "Listo",
};

export function SetupWizard({ checks }: { checks: SetupCheck[] }) {
  const [step, setStep] = useState<Step>("review");
  const requiredReady = checks.every((check) => check.ok || !check.required);
  const emailReady = checks.find((check) => check.id === "email")?.ok ?? false;

  return (
    <>
      <ol className="setup-steps" aria-label="Pasos de la configuración">
        {(Object.keys(stepLabels) as Step[]).map((key, index) => (
          <li
            key={key}
            className={key === step ? "is-current" : undefined}
            aria-current={key === step ? "step" : undefined}
          >
            <span>{index + 1}</span>
            {stepLabels[key]}
          </li>
        ))}
      </ol>

      {step === "review" && (
        <ReviewStep
          checks={checks}
          ready={requiredReady}
          onContinue={() => setStep("account")}
        />
      )}
      {step === "account" && (
        <AccountStep
          onBack={() => setStep("review")}
          onDone={() => setStep("done")}
        />
      )}
      {step === "done" && <DoneStep emailReady={emailReady} />}
    </>
  );
}

function ReviewStep({
  checks,
  ready,
  onContinue,
}: {
  checks: SetupCheck[];
  ready: boolean;
  onContinue: () => void;
}) {
  return (
    <>
      <h1>Revisemos la instalación</h1>
      <p>
        Cloudflare ya creó la base de datos, el almacenamiento y la aplicación.
        Aquí comprobamos que todo responda antes de crear la cuenta del
        administrador.
      </p>
      <ul className="setup-checks">
        {checks.map((check) => (
          <li key={check.id} className={check.ok ? "is-ok" : check.required ? "is-error" : "is-warning"}>
            <div className="setup-check-head">
              {check.ok ? (
                <CheckCircle2 size={20} aria-hidden="true" />
              ) : check.required ? (
                <CircleAlert size={20} aria-hidden="true" />
              ) : (
                <CircleDashed size={20} aria-hidden="true" />
              )}
              <strong>{check.label}</strong>
              <span className="sr-only">
                {check.ok ? "correcto" : check.required ? "requiere atención" : "opcional"}
              </span>
            </div>
            <p>{check.detail}</p>
            {!check.ok && check.steps && (
              <details open={check.required}>
                <summary>Cómo resolverlo</summary>
                <ol>
                  {check.steps.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ol>
              </details>
            )}
            {!check.ok && check.links && (
              <div className="setup-links">
                {check.links.map((link) => (
                  <a
                    key={link.href}
                    className="button button-secondary button-small"
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label}
                    <ExternalLink size={14} aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
      {ready ? (
        <button className="button button-primary button-full" onClick={onContinue}>
          Continuar
        </button>
      ) : (
        <button
          className="button button-primary button-full"
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={17} aria-hidden="true" />
          Ya lo resolví, revisar de nuevo
        </button>
      )}
    </>
  );
}

function AccountStep({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const password = String(form.get("password") ?? "");
    if (password !== String(form.get("passwordConfirm") ?? "")) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }
    setMessage(null);
    setLoading(true);
    const response = await fetch("/api/configuracion-inicial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setupCode: form.get("setupCode"),
        name: form.get("name"),
        email: form.get("email"),
        username: form.get("username"),
        password,
      }),
    }).catch(() => null);
    setLoading(false);
    if (!response) {
      setMessage("No hay conexión. Revise internet e intente de nuevo.");
      return;
    }
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(body?.error ?? "No fue posible crear la cuenta.");
      return;
    }
    onDone();
  }

  return (
    <>
      <h1>Cree la cuenta del administrador</h1>
      <p>
        Esta persona podrá crear las demás cuentas y configurar el sistema.
        Use datos reales de la entidad.
      </p>
      <form className="stack-form" onSubmit={onSubmit}>
        <label>
          <span>Clave de instalación</span>
          <input
            name="setupCode"
            type="password"
            autoComplete="off"
            required
            placeholder="La que escribió al desplegar en Cloudflare (SETUP_CODE)"
          />
        </label>
        <label>
          <span>Nombre completo</span>
          <input name="name" autoComplete="name" required minLength={3} maxLength={120} />
        </label>
        <label>
          <span>Correo electrónico</span>
          <input name="email" type="email" autoComplete="email" required maxLength={180} />
        </label>
        <label>
          <span>Usuario para iniciar sesión</span>
          <input
            name="username"
            autoComplete="username"
            required
            minLength={3}
            maxLength={40}
            pattern="[a-zA-Z0-9._\-]+"
            title="Letras, números, punto, guion o guion bajo, sin espacios"
            placeholder="administrador"
          />
        </label>
        <label>
          <span>Contraseña</span>
          <span className="password-field">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={10}
              maxLength={128}
              placeholder="Mínimo 10 caracteres"
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
        <label>
          <span>Repita la contraseña</span>
          <input
            name="passwordConfirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={10}
            maxLength={128}
          />
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
              Creando la cuenta…
            </>
          ) : (
            "Crear administrador"
          )}
        </button>
        <button type="button" className="button button-ghost button-full" onClick={onBack} disabled={loading}>
          Volver a la revisión
        </button>
      </form>
    </>
  );
}

function DoneStep({ emailReady }: { emailReady: boolean }) {
  return (
    <>
      <h1>¡SIJAC está listo!</h1>
      <div className="success-panel">
        La cuenta de administrador quedó creada. Este asistente ya no volverá a
        aparecer.
      </div>
      <h2 className="setup-subtitle">Siguientes pasos</h2>
      <ol className="setup-next">
        <li>
          <strong>Inicie sesión</strong> con el usuario o correo y la contraseña
          que acaba de crear.
        </li>
        <li>
          <strong>Cree las cuentas del equipo</strong> desde el módulo Usuarios.
          {!emailReady &&
            " Para enviar invitaciones por correo, primero configure Resend (vea la revisión anterior)."}
        </li>
        <li>
          <strong>Opcional: use un dominio propio.</strong> En Cloudflare, abra
          el proyecto «sijac-aguadas» → Configuración (Settings) → Dominios y
          rutas (Domains &amp; Routes) → Agregar (Add) → Dominio personalizado
          (Custom domain). El dominio debe estar administrado en Cloudflare.{" "}
          <a className="text-link" href={CLOUDFLARE_WORKERS_URL} target="_blank" rel="noreferrer">
            Abrir Cloudflare
          </a>
        </li>
        <li>
          <strong>Importe las 68 juntas</strong> cuando tenga el listado oficial
          (lo hace el equipo técnico, ver docs/IMPORTACION.md).
        </li>
      </ol>
      <a className="button button-primary button-full" href="/iniciar-sesion">
        Iniciar sesión
      </a>
    </>
  );
}
