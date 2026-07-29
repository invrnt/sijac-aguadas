"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BookOpenText,
  CalendarDays,
  ClipboardCheck,
  FileBarChart,
  History,
  House,
  Landmark,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { authClient } from "@/lib/auth-client";
import type { CurrentUser } from "@/lib/session";

type NavItem = {
  href: string;
  label: string;
  icon: typeof House;
  admin?: boolean;
};

const primary: NavItem[] = [
  { href: "/panel", label: "Inicio", icon: House },
  { href: "/juntas", label: "Buscar juntas", icon: Search },
  { href: "/reuniones", label: "Reuniones", icon: CalendarDays },
  { href: "/actas", label: "Actas", icon: BookOpenText },
  { href: "/compromisos", label: "Compromisos", icon: ClipboardCheck },
  { href: "/actividades", label: "Actividades", icon: Activity },
  { href: "/reportes", label: "Reportes", icon: FileBarChart },
];

const admin: NavItem[] = [
  { href: "/administracion/usuarios", label: "Usuarios", icon: Users, admin: true },
  { href: "/administracion/auditoria", label: "Auditoría", icon: History, admin: true },
  { href: "/administracion/configuracion", label: "Configuración", icon: Settings, admin: true },
];

const mobile: NavItem[] = [
  primary[0],
  primary[1],
  primary[2],
  primary[4],
  { href: "/mas", label: "Más", icon: Menu },
];

export function AppShell({
  user,
  children,
}: {
  user: CurrentUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  function active(href: string) {
    return href === "/panel"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);
  }

  async function signOut() {
    if (user.demo) {
      await fetch("/api/demo-login", { method: "DELETE" });
    } else {
      await authClient.signOut();
    }
    router.push("/");
    router.refresh();
  }

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="app-layout">
      <aside className="sidebar" aria-label="Navegación principal">
        <BrandMark linked />
        <p className="nav-label">Gestión</p>
        <nav className="main-nav">
          {primary.map((item) => (
            <Link
              key={item.href}
              className={`nav-item ${active(item.href) ? "nav-item-active" : ""}`}
              href={item.href}
            >
              <item.icon size={18} strokeWidth={1.9} aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>
        {user.role === "admin" && (
          <>
            <p className="nav-label">Administración</p>
            <nav className="main-nav">
              {admin.map((item) => (
                <Link
                  key={item.href}
                  className={`nav-item ${active(item.href) ? "nav-item-active" : ""}`}
                  href={item.href}
                >
                  <item.icon size={18} strokeWidth={1.9} aria-hidden="true" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </>
        )}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="user-avatar" aria-hidden="true">
              {initials}
            </span>
            <span>
              <strong>{user.name}</strong>
              <span>{user.role === "admin" ? "Administrador" : user.role}</span>
            </span>
          </div>
          <button
            type="button"
            className="button button-ghost sign-out-button"
            onClick={signOut}
          >
            <LogOut size={17} />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <span className="mobile-header-brand">
            <BrandMark compact linked />
          </span>
          <div className="topbar-title">
            <Landmark size={16} aria-hidden="true" />
            <span>Oficina de Desarrollo Comunitario</span>
          </div>
          {user.demo ? (
            <span className="demo-pill">
              <Sparkles size={13} />
              Datos de demostración
            </span>
          ) : (
            <span className="demo-pill">
              <Shield size={13} />
              Sesión segura
            </span>
          )}
        </header>
        <main id="contenido-principal" className="app-content">
          {children}
        </main>
      </div>
      <nav className="mobile-nav" aria-label="Navegación móvil">
        {mobile.map((item) => (
          <Link
            key={item.href}
            className={active(item.href) ? "nav-item-active" : ""}
            href={item.href}
          >
            <item.icon size={20} strokeWidth={1.9} aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
