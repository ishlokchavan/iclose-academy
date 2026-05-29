"use client";

import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  acceptPartnerInviteAction,
  type AcceptInviteState,
} from "@/features/partner-auth/server/actions";

export function PartnerAcceptInviteForm({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState<AcceptInviteState, FormData>(
    acceptPartnerInviteAction,
    null,
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center sm:text-left">
        <p className="eyebrow">Welcome to iClose Academy</p>
        <h1 className="text-[28px] font-bold tracking-tight text-ink">
          Set your password
        </h1>
        <p className="text-[15px] text-ink-muted">
          Choose a password for {email}. You&apos;ll be signed in straight after.
        </p>
      </div>

      <form action={formAction} className="space-y-4" noValidate>
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="token" value={token} />

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-[14px] font-medium text-ink">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-muted hover:text-ink transition-colors"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </button>
          </div>
          <p className="text-[12px] text-ink-muted">At least 8 characters.</p>
        </div>

        {state?.error ? (
          <p className="text-[13px] text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? <Spinner /> : "Set password and continue"}
        </Button>
      </form>
    </div>
  );
}
