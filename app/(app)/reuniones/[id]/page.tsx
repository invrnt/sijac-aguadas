import { notFound } from "next/navigation";
import { MeetingDetail } from "@/components/MeetingDetail";
import { getMeetingBundle } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Detalle de reunión" };

export default async function MeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const bundle = await getMeetingBundle((await params).id);
  if (!bundle) notFound();
  return (
    <MeetingDetail
      meeting={bundle.meeting}
      initialAgenda={bundle.agenda}
      initialAttendance={bundle.attendance}
      canEdit={user.role !== "consulta"}
    />
  );
}
