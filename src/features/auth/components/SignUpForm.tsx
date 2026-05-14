"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { signUpWithPasswordAction, type ActionState } from "@/features/auth/server/actions";

export function SignUpForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    signUpWithPasswordAction,
    null,
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center sm:text-left">
        <p className="eyebrow">Get started</p>
        <h1 className="text-[28px] font-bold tracking-tight text-ink">Create your account</h1>
        <p className="text-[15px] text-ink-muted">
          Free during MVP. No credit card required.
        </p>
      </div>

      <form action={action} className="space-y-4" noValidate>
        <input type="hidden" name="next" value={next ?? "/topics"} />
        <Field label="Full name" name="fullName" autoComplete="name" required />
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="text-[12px] text-ink-muted">Minimum 8 characters.</p>

        {state?.error ? (
          <p className="text-[13px] text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? <Spinner /> : "Create account"}
        </Button>
      </form>

      <p className="text-[13px] text-ink-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
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
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} {...props} />
    </div>
  );
}
