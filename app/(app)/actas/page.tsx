import { OperationsManager } from "@/components/OperationsManager";
import { PageHeader } from "@/components/PageHeader";
import { PrintButton } from "@/components/PrintButton";
import {
  listJuntasData,
  listMeetingsData,
  listMinutesData,
} from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Actas" };

export default async function MinutesPage() {
  const user = await requireUser();
  const [juntas, meetings, minutes] = await Promise.all([
    listJuntasData({ includeArchived: false }),
    listMeetingsData(),
    listMinutesData(),
  ]);
  return (
    <>
      <PageHeader
        eyebrow="Memoria institucional"
        title="Actas"
        description="Redacte, revise, apruebe y cierre las actas vinculadas a reuniones finalizadas."
        actions={<PrintButton label="Imprimir listado" />}
      />
      <OperationsManager
        entity="actas"
        items={minutes}
        juntas={juntas}
        meetings={meetings}
        canEdit={user.role !== "consulta"}
      />
    </>
  );
}
