import { PageHeader } from "@/components/PageHeader";
import { ReportsClient } from "@/components/ReportsClient";
import {
  listActivitiesData,
  listCommitmentsData,
  listJuntasData,
} from "@/lib/queries";

export const metadata = { title: "Reportes" };

export default async function ReportsPage() {
  const [juntas, commitments, activities] = await Promise.all([
    listJuntasData(),
    listCommitmentsData(),
    listActivitiesData(),
  ]);
  return (
    <>
      <PageHeader
        eyebrow="Información para decisiones"
        title="Reportes"
        description="Genere listados autorizados para impresión o exportación. Los datos restringidos respetan el rol y la política institucional."
      />
      <ReportsClient
        juntas={juntas}
        commitments={commitments}
        activities={activities}
      />
    </>
  );
}
