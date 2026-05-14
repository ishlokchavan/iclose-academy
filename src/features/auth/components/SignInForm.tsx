"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  sendOtpAction,
  signInWithPasswordAction,
  type ActionState,
} from "@/features/auth/server/actions";

type Mode = "password" | "otp";

export function SignInForm({ next }: { next?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");

  const [pwState, pwAction, pwPending] = useActionState<ActionState, FormData>(
    signInWithPasswordAction,
    null,
  );
  const [otpState, otpAction, otpPending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await sendOtpAction(prev, formData);
      if (result?.success && result.nextEmail) {
        const params = new URLSearchParams({ email: result.nextEmail });
        if (next) params.set("next", next);
        router.push(`/verify?${params.toString()}`);
      }
      return result;
    },
    null,
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center sm:text-left">
        <p className="eyebrow">Welcome back</p>
        <h1 className="text-[28px] font-bold tracking-tight text-ink">
          Sign in to iClose Academy
        </h1>
        <p className="text-[15px] text-ink-muted">
          Access your specialist intelligence library.
        </p>
      </div>

      {/* Mode switcher — Apple segmented control style */}
      <div className="flex rounded-xl border border-hairline bg-surface-subtle p-1 text-sm">
        <ModeTab active={mode === "password"} onClick={() => setMode("password")}>
          Password
        </ModeTab>
        <ModeTab active={mode === "otp"} onClick={() => setMode("otp")}>
          Email code
        </ModeTab>
      </div>

      {mode === "password" ? (
        <form action={pwAction} className="space-y-4" noValidate>
          <input type="hidden" name="next" value={next ?? "/topics"} />
          <Field label="Email" name="email" type="email" autoComplete="email" required />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          {pwState?.error ? <FieldError>{pwState.error}</FieldError> : null}
          <Button type="submit" className="w-full" size="lg" disabled={pwPending}>
            {pwPending ? <Spinner /> : "Sign in"}
          </Button>
        </form>
      ) : (
        <form action={otpAction} className="space-y-4" noValidate>
          <input type="hidden" name="next" value={next ?? "/topics"} />
          <Field label="Email" name="email" type="email" autoComplete="email" required />
          {otpState?.error ? <FieldError>{otpState.error}</FieldError> : null}
          <Button type="submit" className="w-full" size="lg" disabled={otpPending}>
            {otpPending ? <Spinner /> : "Email me a 6-digit code"}
          </Button>
        </form>
      )}

      <p className="text-[13px] text-ink-muted">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-medium text-accent hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "flex-1 rounded-lg px-3 py-2 text-[14px] font-medium transition-all duration-150 ease-apple",
        active
          ? "bg-surface-raised text-ink shadow-card"
          : "text-ink-muted hover:text-ink",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  name,
  type = "text",
  ...props
}: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-[14px] font-medium text-ink">
        {label}
      </Label>
      <Input id={name} name={name} type={type} {...props} />
    </div>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13px] text-destructive" role="alert">
      {children}
    </p>
  );
}
