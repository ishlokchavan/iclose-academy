import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PartnerAcceptInviteForm } from "@/features/partner-auth/components/PartnerAcceptInviteForm";

export const metadata: Metadata = { title: "Accept your partner invite" };

export default async function PartnerAcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }>;
}) {
  const { email, token } = await searchParams;
  if (!email || !token) redirect("/partner/login");
  return <PartnerAcceptInviteForm email={email} token={token} />;
}
