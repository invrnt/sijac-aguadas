import { PageHeader } from "@/components/PageHeader";
import { JuntaForm } from "@/components/JuntaForm";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata = { title: "Registrar JAC" };

export default async function NewJuntaPage() {
  const user = await requireUser();
  if (user.role === "consulta") redirect("/juntas");
  return (
    <>
      <PageHeader
        eyebrow="Nuevo registro"
        title="Registrar Junta de Acción Comunal"
        description="Complete la información disponible. Los datos históricos faltantes pueden quedar pendientes."
      />
      <JuntaForm />
    </>
  );
}
