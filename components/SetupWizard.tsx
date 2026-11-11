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
const CLOUDFLARE_DASHBOARD_URL = "https://dash.cloudflare.com/";

type Step = "review" | "account" | "done";

type EmailResult = {
  status: "sent" | "failed" | "skipped";
  code?: string;
  to: string;
};

const stepLabels: Record<Step, string> = {
  review: "Revisión",
  account: "Administradores",
  done: "Listo",
};

export function SetupWizard({ checks }: { checks: SetupCheck[] }) {
  const [step, setStep] = useState<Step>("review");
  const [emailResults, setEmailResults] = useState<EmailResult[]>([]);
  const requiredReady = checks.every((check) => check.ok || !check.required);

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
          onDone={(results) => {
            setEmailResults(results);
            setStep("done");
          }}
        />
      )}
      {step === "done" && <DoneStep emails={emailResults} />}
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
            {check.steps && (
              <details open={!check.ok && check.required}>
                <summary>{check.ok ? "Qué falta para que lleguen" : "Cómo resolverlo"}</summary>
                <ol>
                  {check.steps.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ol>
              </details>
            )}
            {check.links && (
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

const ADMIN_SLOTS = [
  {
    key: "admin1",
    legend: "Administrador principal",
    hint: "Normalmente quien está haciendo esta instalación.",
    usernamePlaceholder: "administrador",
  },
  {
    key: "admin2",
    legend: "Segundo administrador",
    hint: "Otra persona de la entidad, por ejemplo quien la reemplaza. Si alguno pierde el acceso, el otro puede restablecerlo.",
    usernamePlaceholder: "administrador2",
  },
] as const;

function readAdmin(form: FormData, key: string) {
  return {
    name: String(form.get(`${key}.name`) ?? "").trim(),
    email: String(form.get(`${key}.email`) ?? "").trim().toLowerCase(),
    username: String(form.get(`${key}.username`) ?? "").trim().toLowerCase(),
    password: String(form.get(`${key}.password`) ?? ""),
    passwordConfirm: String(form.get(`${key}.passwordConfirm`) ?? ""),
  };
}

function AdminFields({
  slot,
}: {
  slot: (typeof ADMIN_SLOTS)[number];
}) {
  const [showPassword, setShowPassword] = useState(false);
  const { key } = slot;
  return (
    <fieldset className="setup-admin">
      <legend>{slot.legend}</legend>
      <p className="form-hint">{slot.hint}</p>
      <label>
        <span>Nombre completo</span>
        <input name={`${key}.name`} autoComplete="off" required minLength={3} maxLength={120} />
      </label>
      <label>
        <span>Correo electrónico</span>
        <input name={`${key}.email`} type="email" autoComplete="off" required maxLength={180} />
      </label>
      <label>
        <span>Usuario para iniciar sesión</span>
        <input
          name={`${key}.username`}
          autoComplete="off"
          required
          minLength={3}
          maxLength={40}
          pattern="[a-zA-Z0-9._\-]+"
          title="Letras, números, punto, guion o guion bajo, sin espacios"
          placeholder={slot.usernamePlaceholder}
        />
      </label>
      <label>
        <span>Contraseña</span>
        <span className="password-field">
          <input
            name={`${key}.password`}
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
          name={`${key}.passwordConfirm`}
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={10}
          maxLength={128}
        />
      </label>
    </fieldset>
  );
}

function AccountStep({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: (emails: EmailResult[]) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const [first, second] = ADMIN_SLOTS.map((slot) => readAdmin(form, slot.key));
    if (first.password !== first.passwordConfirm) {
      setMessage("Las contraseñas del administrador principal no coinciden.");
      return;
    }
    if (second.password !== second.passwordConfirm) {
      setMessage("Las contraseñas del segundo administrador no coinciden.");
      return;
    }
    if (first.email === second.email || first.username === second.username) {
      setMessage(
        "Los dos administradores deben ser personas distintas, con correo y usuario diferentes.",
      );
      return;
    }
    setMessage(null);
    setLoading(true);
    const response = await fetch("/api/configuracion-inicial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setupCode: form.get("setupCode"),
        admins: [first, second].map((admin) => ({
          name: admin.name,
          email: admin.email,
          username: admin.username,
          password: admin.password,
        })),
      }),
    }).catch(() => null);
    setLoading(false);
    if (!response) {
      setMessage("No hay conexión. Revise internet e intente de nuevo.");
      return;
    }
    const body = (await response.json().catch(() => null)) as {
      error?: string;
      emails?: EmailResult[];
    } | null;
    if (!response.ok) {
      setMessage(body?.error ?? "No fue posible crear las cuentas.");
      return;
    }
    onDone(body?.emails ?? []);
  }

  return (
    <>
      <h1>Cree las cuentas de administrador</h1>
      <p>
        Se crean dos administradores para que la entidad nunca se quede sin
        acceso: si una persona olvida su contraseña o deja el cargo, la otra
        puede gestionar las cuentas. Use datos reales.
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
        {ADMIN_SLOTS.map((slot) => (
          <AdminFields key={slot.key} slot={slot} />
        ))}
        {message && (
          <p className="form-message error-message" role="alert">
            {message}
          </p>
        )}
        <button className="button button-primary button-full" disabled={loading}>
          {loading ? (
            <>
              <LoaderCircle className="spin" size={18} />
              Creando las cuentas…
            </>
          ) : (
            "Crear los dos administradores"
          )}
        </button>
        <button type="button" className="button button-ghost button-full" onClick={onBack} disabled={loading}>
          Volver a la revisión
        </button>
      </form>
    </>
  );
}

function emailFailureHelp(code?: string) {
  switch (code) {
    case "E_SENDER_DOMAIN_NOT_AVAILABLE":
    case "E_SENDER_NOT_VERIFIED":
      return "El dominio del remitente todavía no está dado de alta o verificado. En Cloudflare abra Email Service → Email Sending, pulse «Onboard Domain», elija el dominio y espere entre 5 y 15 minutos.";
    case "E_RATE_LIMIT_EXCEEDED":
    case "E_DAILY_LIMIT_EXCEEDED":
      return "Se alcanzó el límite de envío de la cuenta. Las cuentas nuevas empiezan con un cupo bajo que crece con el uso; intente más tarde.";
    case "E_ACCOUNT_SUSPENDED":
      return "Cloudflare pausó el envío de correos de la cuenta. Revise los avisos en el panel de Cloudflare.";
    default:
      return "Revise que la cuenta tenga el plan Workers Paid y que el dominio del remitente esté dado de alta en Email Service → Email Sending.";
  }
}

function EmailStatus({ emails }: { emails: EmailResult[] }) {
  if (!emails.length || emails.every((email) => email.status === "skipped")) {
    return (
      <p className="form-message setup-email-warning">
        El envío de correos aún no está configurado. Puede activarlo después:
        las invitaciones y recuperaciones de contraseña lo necesitan.
      </p>
    );
  }
  const sent = emails.filter((email) => email.status === "sent");
  const failed = emails.filter((email) => email.status === "failed");
  return (
    <>
      {sent.length > 0 && (
        <p className="success-panel">
          Enviamos un correo de prueba a{" "}
          {sent.map((email, index) => (
            <span key={email.to}>
              {index > 0 && " y "}
              <strong>{email.to}</strong>
            </span>
          ))}
          . Si llega, el envío funciona. Si no lo ve en unos minutos, revise la
          carpeta de spam.
        </p>
      )}
      {failed.length > 0 && (
        <div className="form-message error-message" role="alert">
          <p>
            No se pudo enviar el correo de prueba a{" "}
            {failed.map((email, index) => (
              <span key={email.to}>
                {index > 0 && " ni a "}
                <strong>{email.to}</strong>
              </span>
            ))}
            {failed[0].code ? ` (código ${failed[0].code})` : ""}.
          </p>
          <p>{emailFailureHelp(failed[0].code)}</p>
          <a className="text-link" href={CLOUDFLARE_DASHBOARD_URL} target="_blank" rel="noreferrer">
            Abrir el panel de Cloudflare
          </a>
        </div>
      )}
    </>
  );
}

function DoneStep({ emails }: { emails: EmailResult[] }) {
  const emailReady =
    emails.length > 0 && emails.every((email) => email.status === "sent");
  return (
    <>
      <h1>¡SIJAC está listo!</h1>
      <div className="success-panel">
        Las dos cuentas de administrador quedaron creadas. Este asistente ya no
        volverá a aparecer.
      </div>
      <EmailStatus emails={emails} />
      <h2 className="setup-subtitle">Siguientes pasos</h2>
      <ol className="setup-next">
        <li>
          <strong>Inicien sesión</strong> cada uno con su usuario o correo y su
          contraseña. Entregue al segundo administrador sus datos en persona,
          nunca por chat o correo.
        </li>
        <li>
          <strong>Cree las cuentas del equipo</strong> desde el módulo Usuarios.
          {!emailReady &&
            " Las invitaciones llegan por correo, así que primero deje funcionando el envío."}
        </li>
        <li>
          <strong>Opcional: use el dominio en la aplicación.</strong> En
          Cloudflare, abra el proyecto «sijac-aguadas» → Configuración
          (Settings) → Dominios y rutas (Domains &amp; Routes) → Agregar (Add) →
          Dominio personalizado (Custom domain), por ejemplo sijac.org.{" "}
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
