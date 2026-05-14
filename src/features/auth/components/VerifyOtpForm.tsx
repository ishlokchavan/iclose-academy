"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  sendOtpAction,
  verifyOtpAction,
  type ActionState,
} from "@/features/auth/server/actions";

export function VerifyOtpForm({ email, next }: { email: string; next?: string }) {
  const [verifyState, verifyAction, verifyPending] = useActionState<ActionState, FormData>(
    verifyOtpAction,
    null,
  );
  const [resendState, resendAction, resendPending] = useActionState<ActionState, FormData>(
    sendOtpAction,
    null,
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <p className="eyebrow">Check your email</p>
        <h1 className="display text-display-lg text-ink">Enter your 6-digit code</h1>
        <p className="text-sm text-ink-muted">
          We sent a code to <span className="text-ink">{email}</span>. It expires in 10 minutes.
        </p>
      </div>

      <form action={verifyAction} className="space-y-4" noValidate>
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="next" value={next ?? ""} />

        <div className="space-y-1.5">
          <Label htmlFor="token">Code</Label>
          <Input
            id="token"
            name="token"
            inputMode="numeric"
            pattern="\d{6,10}"
            maxLength={10}
            autoComplete="one-time-code"
            placeholder="123456"
            className="text-center font-mono text-lg tracking-[0.5em]"
            required
          />
        </div>

        {verifyState?.error ? (
          <p className="text-sm text-destructive" role="alert">
            {verifyState.error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" size="lg" disabled={verifyPending}>
          {verifyPending ? <Spinner /> : "Verify and continue"}
        </Button>
      </form>

      <form action={resendAction} className="text-center">
        <input type="hidden" name="email" value={email} />
        <Button type="submit" variant="link" size="sm" disabled={resendPending}>
          {resendPending ? "Resending…" : "Resend code"}
        </Button>
        {resendState?.success ? (
          <p className="text-xs text-ink-muted">Sent again.</p>
        ) : null}
      </form>
    </div>
  );
}
