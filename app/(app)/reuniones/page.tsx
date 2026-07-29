import { OperationsManager } from "@/components/OperationsManager";
import { PageHeader } from "@/components/PageHeader";
import { PrintButton } from "@/components/PrintButton";
import { listJuntasData, listMeetingsData } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Reuniones" };

export default async function MeetingsPage({
  searchParams,
}: {
  searchParams: Promise<{ nueva?: string }>;
}) {
  const user = await requireUser();
  const [juntas, meetings] = await Promise.all([
    listJuntasData({ includeArchived: false }),
    listMeetingsData(),
  ]);
  return (
    <>
      <PageHeader
        eyebrow="Gestión comunitaria"
        title="Reuniones"
        description="Planifique convocatorias, orden del día y asistencia de cada Junta de Acción Comunal."
        actions={<PrintButton label="Imprimir agenda" />}
      />
      <OperationsManager
        entity="reuniones"
        items={meetings}
        juntas={juntas}
        canEdit={user.role !== "consulta"}
        startOpen={(await searchParams).nueva === "1"}
      />
    </>
  );
}
