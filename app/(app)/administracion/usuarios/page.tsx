import { PageHeader } from "@/components/PageHeader";
import { UsersAdmin } from "@/components/UsersAdmin";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Usuarios" };

export default async function UsersPage() {
  const user = await requireAdmin();
  return (
    <>
      <PageHeader
        eyebrow="Administración"
        title="Usuarios y roles"
        description="Cree, invite, suspenda y reactive cuentas. Los cambios de rol y estado quedan auditados."
      />
      <UsersAdmin demo={user.demo} />
    </>
  );
}
