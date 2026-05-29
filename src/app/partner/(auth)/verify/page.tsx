import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PartnerVerifyOtpForm } from "@/features/partner-auth/components/PartnerVerifyOtpForm";

export const metadata: Metadata = { title: "Verify your email" };

export default async function PartnerVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; next?: string }>;
}) {
  const { email, next } = await searchParams;
  if (!email) redirect("/partner/login");
  return <PartnerVerifyOtpForm email={email} next={next} />;
}
