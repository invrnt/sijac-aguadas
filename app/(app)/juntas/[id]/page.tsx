import { notFound } from "next/navigation";
import { JuntaDetail } from "@/components/JuntaDetail";
import { getJuntaBundle } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const bundle = await getJuntaBundle((await params).id);
  return { title: bundle?.junta.officialName ?? "Ficha de JAC" };
}

export default async function JuntaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const bundle = await getJuntaBundle(id);
  if (!bundle) notFound();

  return (
    <JuntaDetail
      junta={bundle.junta}
      dignatarios={bundle.dignatarios}
      convenios={bundle.convenios}
      files={bundle.files}
      canEdit={user.role !== "consulta"}
    />
  );
}
