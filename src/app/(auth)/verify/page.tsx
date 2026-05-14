import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { VerifyOtpForm } from "@/features/auth/components/VerifyOtpForm";

export const metadata: Metadata = { title: "Verify your email" };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; next?: string }>;
}) {
  const { email, next } = await searchParams;
  if (!email) redirect("/sign-in");
  return <VerifyOtpForm email={email} next={next} />;
}
