import { SetupCompleteEmail } from "@/emails/SetupCompleteEmail";
import { EmailError, emailProvider, sendAccessEmail } from "@/lib/mail";

export type SetupEmailResult = {
  status: "sent" | "failed" | "skipped";
  code?: string;
};

export async function sendSetupTestEmail({
  to,
  name,
  origin,
}: {
  to: string;
  name: string;
  origin: string;
}): Promise<SetupEmailResult> {
  if (emailProvider() === "none") return { status: "skipped" };
  const message = (
    <SetupCompleteEmail userName={name} loginUrl={`${origin}/iniciar-sesion`} />
  );
  try {
    await sendAccessEmail({ to, subject: "SIJAC Aguadas está listo", email: message });
    return { status: "sent" };
  } catch (error) {
    return {
      status: "failed",
      code: error instanceof EmailError ? error.code : "E_UNKNOWN",
    };
  }
}
