import { notFound, redirect } from "next/navigation";
import { JuntaForm } from "@/components/JuntaForm";
import { PageHeader } from "@/components/PageHeader";
import { getJuntaBundle } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Editar JAC" };

export default async function EditJuntaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (user.role === "consulta") redirect("/juntas");
  const { id } = await params;
  const bundle = await getJuntaBundle(id);
  if (!bundle) notFound();
  return (
    <>
      <PageHeader
        eyebrow={bundle.junta.code}
        title="Editar información de la JAC"
        description="Los cambios sensibles quedarán registrados en la auditoría."
      />
      <JuntaForm junta={bundle.junta} />
    </>
  );
}
