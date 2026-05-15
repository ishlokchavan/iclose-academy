"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Spinner } from "@/components/ui/spinner";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Status = "verifying" | "ready" | "error";

export function AcceptInviteClient() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("verifying");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const token = params.get("token");
  const email = params.get("email");

  useEffect(() => {
    if (!token || !email) {
      // Fallback: check hash fragment for Supabase implicit-flow tokens
      const hash = window.location.hash.slice(1);
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const type = hashParams.get("type");

      if (accessToken && type === "invite") {
        const supabase = createSupabaseBrowserClient();
        supabase.auth
          .setSession({ access_token: accessToken, refresh_token: refreshToken ?? "" })
          .then(({ error }) => {
            if (error) {
              setErrorMsg(error.message);
              setStatus("error");
            } else {
              setStatus("ready");
            }
          });
        return;
      }

      setErrorMsg("Invalid or missing invitation link. Please request a new invite.");
      setStatus("error");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    supabase.auth
      .verifyOtp({ email, token, type: "invite" })
      .then(({ error }) => {
        if (error) {
          setErrorMsg(error.message);
          setStatus("error");
        } else {
          setStatus("ready");
        }
      });
  }, [token, email, router]);

  if (status === "verifying") {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <Spinner className="size-6 text-accent" />
        <p className="text-[15px] text-ink-muted">Verifying your invitation…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-4 text-center py-6">
        <p className="text-[17px] font-semibold text-ink">Invitation error</p>
        <p className="text-[14px] text-ink-muted">{errorMsg}</p>
        <a
          href="/sign-in"
          className="inline-block text-[13px] text-accent hover:underline"
        >
          Go to sign in
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center sm:text-left">
        <p className="eyebrow">Welcome to iClose Academy</p>
        <h1 className="text-[28px] font-bold tracking-tight text-ink">Set your password</h1>
        <p className="text-[15px] text-ink-muted">
          Your account is ready. Choose a password to complete setup.
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  );
}
