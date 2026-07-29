import { OperationsManager } from "@/components/OperationsManager";
import { PageHeader } from "@/components/PageHeader";
import { PrintButton } from "@/components/PrintButton";
import { listActivitiesData, listJuntasData } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Actividades" };

export default async function ActivitiesPage() {
  const user = await requireUser();
  const [juntas, activities] = await Promise.all([
    listJuntasData({ includeArchived: false }),
    listActivitiesData(),
  ]);
  return (
    <>
      <PageHeader
        eyebrow="Acción comunitaria"
        title="Actividades"
        description="Registre jornadas, talleres, beneficiarios, responsables y evidencias de ejecución."
        actions={<PrintButton label="Imprimir actividades" />}
      />
      <OperationsManager
        entity="actividades"
        items={activities}
        juntas={juntas}
        canEdit={user.role !== "consulta"}
      />
    </>
  );
}
