import { notFound } from "next/navigation";
import { MinuteDetail } from "@/components/MinuteDetail";
import { getMinuteBundle } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Detalle de acta" };

export default async function MinutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const bundle = await getMinuteBundle((await params).id);
  if (!bundle) notFound();
  return (
    <MinuteDetail
      minute={bundle.minute}
      meeting={bundle.meeting}
      initialSections={bundle.sections}
      initialDecisions={bundle.decisions}
      canEdit={user.role !== "consulta" && bundle.minute.status !== "cerrada"}
    />
  );
}
