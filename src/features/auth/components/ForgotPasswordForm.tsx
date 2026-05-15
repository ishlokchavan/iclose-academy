"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { forgotPasswordAction, type ActionState } from "@/features/auth/server/actions";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    forgotPasswordAction,
    null,
  );

  if (state?.success) {
    return (
      <div className="space-y-4 text-center sm:text-left">
        <p className="eyebrow">Check your email</p>
        <h1 className="text-[28px] font-bold tracking-tight text-ink">Reset link sent</h1>
        <p className="text-[15px] text-ink-muted">{state.success}</p>
        <Link
          href="/sign-in"
          className="inline-block text-[14px] font-medium text-accent hover:underline"
        >
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center sm:text-left">
        <p className="eyebrow">Account access</p>
        <h1 className="text-[28px] font-bold tracking-tight text-ink">Forgot your password?</h1>
        <p className="text-[15px] text-ink-muted">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form action={action} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[14px] font-medium text-ink">
            Email
          </Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>

        {state?.error ? (
          <p className="text-[13px] text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? <Spinner /> : "Send reset link"}
        </Button>
      </form>

      <Link
        href="/sign-in"
        className="block text-center text-[13px] text-ink-muted hover:text-ink transition-colors"
      >
        ← Back to sign in
      </Link>
    </div>
  );
}
