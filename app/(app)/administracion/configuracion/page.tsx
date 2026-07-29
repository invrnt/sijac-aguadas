import { PageHeader } from "@/components/PageHeader";
import { SettingsForm } from "@/components/SettingsForm";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Configuración" };

export default async function SettingsPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader
        eyebrow="Administración"
        title="Configuración institucional"
        description="Actualice identidad, políticas de privacidad, categorías y límites operativos."
      />
      <SettingsForm />
    </>
  );
}
