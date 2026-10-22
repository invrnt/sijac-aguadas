import { ManualClient } from "@/components/ManualClient";
import { PageHeader } from "@/components/PageHeader";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Manual de usuario" };

export default async function ManualPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader
        eyebrow="Ayuda"
        title="Manual de usuario"
        description="Aprenda a usar SIJAC Aguadas paso a paso: busque, registre, haga seguimiento y genere reportes."
      />
      <ManualClient initialRole={user.role === "consulta" ? "consulta" : "edicion"} />
    </>
  );
}
