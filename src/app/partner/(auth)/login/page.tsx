import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PartnerSignInForm } from "@/features/partner-auth/components/PartnerSignInForm";
import { ROLE_LANDING } from "@/config/nav";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Partner sign in" };

export default async function PartnerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const user = await getSessionUser();
  if (user) redirect(ROLE_LANDING[user.role]);
  return <PartnerSignInForm next={next} />;
}
