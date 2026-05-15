"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateOwnProfileAction } from "@/features/profile/server/actions";

type Props = {
  initialFirstName: string;
  initialLastName: string;
  initialEmail: string;
  initialPhone: string;
};

export function ProfileEditForm({
  initialFirstName,
  initialLastName,
  initialEmail,
  initialPhone,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    first_name: initialFirstName,
    last_name: initialLastName,
    email: initialEmail,
    phone: initialPhone,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError(null);
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await updateOwnProfileAction(form);
      if (result.error) {
        setError(result.error);
      } else if (result.emailVerificationSent && result.newEmail) {
        setVerificationSent(true);
        setPendingEmail(result.newEmail);
        setSaved(true);
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="first_name" className="text-[12px] text-ink-muted">First name</Label>
          <Input
            id="first_name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            placeholder="First"
            disabled={isPending}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last_name" className="text-[12px] text-ink-muted">Last name</Label>
          <Input
            id="last_name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            placeholder="Last"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-[12px] text-ink-muted">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          disabled={isPending}
        />
        <p className="text-[11px] text-ink-muted">
          If changed, you&apos;ll receive a verification email at the new address.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone" className="text-[12px] text-ink-muted">Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          placeholder="+1 555 000 0000"
          disabled={isPending}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600 border border-red-200">
          {error}
        </p>
      )}

      {verificationSent && pendingEmail && (
        <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2.5">
          <Mail className="size-3.5 mt-0.5 shrink-0 text-blue-600" />
          <p className="text-[12px] text-blue-700">
            Verification email sent to <strong>{pendingEmail}</strong>. Check your inbox to confirm the change.
          </p>
        </div>
      )}

      {saved && !verificationSent && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2">
          <CheckCircle2 className="size-3.5 shrink-0 text-green-600" />
          <p className="text-[12px] text-green-700">Profile updated.</p>
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
