import Link from "next/link";
import {
  Activity,
  BookOpenText,
  FileBarChart,
  History,
  LifeBuoy,
  Settings,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Más opciones" };

export default async function MorePage() {
  const user = await requireUser();
  const links = [
    { href: "/actas", label: "Actas", icon: BookOpenText },
    { href: "/actividades", label: "Actividades", icon: Activity },
    { href: "/reportes", label: "Reportes", icon: FileBarChart },
    { href: "/manual", label: "Manual", icon: LifeBuoy },
    ...(user.role === "admin"
      ? [
          { href: "/administracion/usuarios", label: "Usuarios", icon: Users },
          { href: "/administracion/auditoria", label: "Auditoría", icon: History },
          {
            href: "/administracion/configuracion",
            label: "Configuración",
            icon: Settings,
          },
        ]
      : []),
  ];
  return (
    <>
      <PageHeader title="Más opciones" description="Accesos adicionales de SIJAC Aguadas." />
      <section className="quick-actions">
        {links.map((item) => (
          <Link className="quick-action" href={item.href} key={item.href}>
            <item.icon size={22} />
            {item.label}
          </Link>
        ))}
      </section>
    </>
  );
}
