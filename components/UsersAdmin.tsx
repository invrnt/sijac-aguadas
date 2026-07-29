"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Ban, CheckCircle2, Plus } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { authClient } from "@/lib/auth-client";

type UserRow = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "admin" | "consulta";
  status: "activa" | "invitada" | "suspendida";
  lastAccess: string;
};

const initialUsers: UserRow[] = [
  {
    id: "demo-user-1",
    name: "Administradora SIJAC",
    email: "admin@demo.sijac.local",
    username: "administrador",
    role: "admin",
    status: "activa",
    lastAccess: "2026-07-28T16:02:00-05:00",
  },
  {
    id: "demo-user-2",
    name: "Consulta Desarrollo Comunitario",
    email: "consulta@demo.sijac.local",
    username: "consulta.odc",
    role: "consulta",
    status: "activa",
    lastAccess: "2026-07-28T08:15:00-05:00",
  },
  {
    id: "demo-user-3",
    name: "Apoyo institucional",
    email: "apoyo@demo.sijac.local",
    username: "apoyo",
    role: "consulta",
    status: "suspendida",
    lastAccess: "2026-06-17T11:30:00-05:00",
  },
];

export function UsersAdmin({ demo }: { demo: boolean }) {
  const [users, setUsers] = useState(initialUsers);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (demo) return;
    void authClient.admin
      .listUsers({ query: { limit: 100, sortBy: "name", sortDirection: "asc" } })
      .then((result) => {
        if (!result.data) return;
        setUsers(
          result.data.users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            username: (user as typeof user & { username?: string }).username ?? "",
            role: user.role === "admin" ? "admin" : "consulta",
            status: user.banned ? "suspendida" : "activa",
            lastAccess: "",
          })),
        );
      });
  }, [demo]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const row: UserRow = {
      id: crypto.randomUUID(),
      name: String(form.get("name")),
      email: String(form.get("email")),
      username: String(form.get("username")),
      role: form.get("role") as UserRow["role"],
      status: "invitada",
      lastAccess: "",
    };
    if (!demo) {
      const temporaryPassword = `${crypto.randomUUID()}Aa!9`;
      const result = await authClient.admin.createUser({
        email: row.email,
        password: temporaryPassword,
        name: row.name,
        role: row.role === "admin" ? "admin" : "user",
        data: { username: row.username, displayUsername: row.username },
      });
      if (result.error || !result.data) {
        setMessage("No fue posible crear la cuenta. Revise correo y usuario.");
        return;
      }
      row.id = result.data.user.id;
      await authClient.requestPasswordReset({
        email: row.email,
        redirectTo: "/nueva-contrasena",
      });
    }
    setUsers((current) => [row, ...current]);
    setOpen(false);
    setMessage(
      demo
        ? "Cuenta de demostración creada."
        : "La invitación será enviada al correo registrado.",
    );
    event.currentTarget.reset();
  }

  async function toggle(user: UserRow) {
    if (
      user.role === "admin" &&
      user.status === "activa" &&
      users.filter((item) => item.role === "admin" && item.status === "activa")
        .length === 1
    ) {
      setMessage("No se puede suspender al último administrador activo.");
      return;
    }
    if (!demo) {
      const result =
        user.status === "suspendida"
          ? await authClient.admin.unbanUser({ userId: user.id })
          : await authClient.admin.banUser({
              userId: user.id,
              banReason: "Cuenta suspendida por un administrador de SIJAC",
            });
      if (result.error) {
        setMessage("No fue posible cambiar el estado de la cuenta.");
        return;
      }
    }
    setUsers((current) =>
      current.map((item) =>
        item.id === user.id
          ? {
              ...item,
              status: item.status === "suspendida" ? "activa" : "suspendida",
            }
          : item,
      ),
    );
  }

  return (
    <>
      <div className="page-actions" style={{ marginBottom: 18 }}>
        <button className="button button-primary" onClick={() => setOpen(!open)}>
          <Plus size={17} />
          Crear o invitar cuenta
        </button>
      </div>
      {open && (
        <section className="inline-create">
          <div className="inline-create-header">
            <div>
              <h2>Nueva cuenta</h2>
              <p>La persona podrá establecer una contraseña mediante un enlace seguro.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={create}>
            <label>
              <span>Nombre completo *</span>
              <input name="name" required maxLength={180} />
            </label>
            <label>
              <span>Correo electrónico *</span>
              <input name="email" type="email" required />
            </label>
            <label>
              <span>Nombre de usuario *</span>
              <input name="username" required minLength={3} maxLength={40} />
            </label>
            <label>
              <span>Rol *</span>
              <select name="role" defaultValue="consulta">
                <option value="consulta">Consulta</option>
                <option value="admin">Administrador</option>
              </select>
            </label>
            <div className="full page-actions">
              <button className="button button-primary">Crear invitación</button>
            </div>
          </form>
        </section>
      )}
      {message && (
        <p className={message.startsWith("No se") ? "form-message error-message" : "success-panel"}>
          {message}
        </p>
      )}
      <section className="card">
        <table className="data-table desktop-table">
          <thead>
            <tr>
              <th>Cuenta</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Último acceso</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <span className="cell-title">{user.name}</span>
                  <span className="cell-subtitle">{user.email}</span>
                </td>
                <td>{user.username}</td>
                <td style={{ textTransform: "capitalize" }}>{user.role}</td>
                <td>
                  {user.lastAccess
                    ? new Intl.DateTimeFormat("es-CO", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(user.lastAccess))
                    : "Aún no ingresa"}
                </td>
                <td>
                  <StatusBadge status={user.status} />
                </td>
                <td>
                  <button
                    className="button button-ghost button-small"
                    onClick={() => toggle(user)}
                  >
                    {user.status === "suspendida" ? (
                      <CheckCircle2 size={15} />
                    ) : (
                      <Ban size={15} />
                    )}
                    {user.status === "suspendida" ? "Reactivar" : "Suspender"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="responsive-cards">
          {users.map((user) => (
            <article className="entity-card" key={user.id}>
              <div className="entity-card-header">
                <div>
                  <h3>{user.name}</h3>
                  <span className="cell-subtitle">{user.email}</span>
                </div>
                <StatusBadge status={user.status} />
              </div>
              <dl>
                <div>
                  <dt>Usuario</dt>
                  <dd>{user.username}</dd>
                </div>
                <div>
                  <dt>Rol</dt>
                  <dd>{user.role}</dd>
                </div>
              </dl>
              <button
                className="button button-secondary button-full"
                onClick={() => toggle(user)}
              >
                {user.status === "suspendida" ? "Reactivar cuenta" : "Suspender cuenta"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
