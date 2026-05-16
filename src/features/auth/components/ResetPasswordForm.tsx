"use client";

import { Eye, EyeOff } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { resetPasswordAction, type ActionState } from "@/features/auth/server/actions";

export function ResetPasswordForm() {
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (accessToken && refreshToken && type === "recovery") {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error }) => {
          if (error) setSessionError(error.message);
          else setSessionReady(true);
        });
    } else {
      // No hash tokens — user is already signed in (regular password change)
      setSessionReady(true);
    }
  }, []);

  const [state, action, pending] = useActionState<ActionState, FormData>(
    resetPasswordAction,
    null,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (sessionError) {
    return (
      <p className="text-[13px] text-destructive" role="alert">
        {sessionError} — please request a new invite.
      </p>
    );
  }

  if (!sessionReady) {
    return <p className="text-[15px] text-ink-muted">Verifying your link…</p>;
  }


  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center sm:text-left">
        <p className="eyebrow">Account access</p>
        <h1 className="text-[28px] font-bold tracking-tight text-ink">Set a new password</h1>
        <p className="text-[15px] text-ink-muted">Choose a strong password for your account.</p>
      </div>

      <form action={action} className="space-y-4" noValidate>
        <PasswordField
          id="password"
          name="password"
          label="New password"
          autoComplete="new-password"
          show={showPassword}
          onToggle={() => setShowPassword((v) => !v)}
        />
        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          show={showConfirm}
          onToggle={() => setShowConfirm((v) => !v)}
        />

        {state?.error ? (
          <p className="text-[13px] text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? <Spinner /> : "Update password"}
        </Button>
      </form>
    </div>
  );
}

function PasswordField({
  id,
  name,
  label,
  show,
  onToggle,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  show: boolean;
  onToggle: () => void;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[14px] font-medium text-ink">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          required
          className="pr-10"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-muted hover:text-ink transition-colors"
        >
          {show ? (
            <EyeOff className="size-4" aria-hidden />
          ) : (
            <Eye className="size-4" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}
