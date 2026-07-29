import { OperationsManager } from "@/components/OperationsManager";
import { PageHeader } from "@/components/PageHeader";
import { PrintButton } from "@/components/PrintButton";
import { listCommitmentsData, listJuntasData } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Compromisos" };

export default async function CommitmentsPage() {
  const user = await requireUser();
  const [juntas, commitments] = await Promise.all([
    listJuntasData({ includeArchived: false }),
    listCommitmentsData(),
  ]);
  return (
    <>
      <PageHeader
        eyebrow="Seguimiento"
        title="Compromisos"
        description="Controle responsables, fechas límite, avances y evidencias de los acuerdos comunitarios."
        actions={<PrintButton label="Imprimir seguimiento" />}
      />
      <OperationsManager
        entity="compromisos"
        items={commitments}
        juntas={juntas}
        canEdit={user.role !== "consulta"}
      />
    </>
  );
}
