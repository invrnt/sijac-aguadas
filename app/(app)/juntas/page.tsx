import Link from "next/link";
import { Plus } from "lucide-react";
import { JuntasClient } from "@/components/JuntasClient";
import { PageHeader } from "@/components/PageHeader";
import { PrintButton } from "@/components/PrintButton";
import { listJuntasData } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Juntas" };

export default async function JuntasPage() {
  const user = await requireUser();
  const juntas = await listJuntasData();
  return (
    <>
      <PageHeader
        eyebrow="Registro municipal"
        title="Juntas de Acción Comunal"
        description="Busque por código, nombre, vereda o barrio, NIT, personería jurídica y número de convenio."
        actions={
          <>
            <PrintButton label="Imprimir listado" />
            {user.role !== "consulta" && (
              <Link className="button button-primary" href="/juntas/nueva">
                <Plus size={17} />
                Registrar JAC
              </Link>
            )}
          </>
        }
      />
      <JuntasClient juntas={juntas} />
    </>
  );
}
