"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  updatePartnerProfileAction,
  type PartnerProfileState,
} from "@/features/partner-auth/server/actions";

type Props = {
  initialName: string;
  initialPhone: string | null;
};

export function PartnerProfileForm({ initialName, initialPhone }: Props) {
  const [state, formAction, pending] = useActionState<PartnerProfileState, FormData>(
    updatePartnerProfileAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-[14px] font-medium text-ink">
          Full name
        </Label>
        <Input
          id="name"
          name="name"
          defaultValue={initialName}
          autoComplete="name"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone" className="text-[14px] font-medium text-ink">
          Phone
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={initialPhone ?? ""}
          autoComplete="tel"
          placeholder="+971 50 000 0000"
        />
      </div>

      {state && "error" in state ? (
        <p className="text-[13px] text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state && "success" in state ? (
        <p className="text-[13px] text-emerald-600">{state.success}</p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? <Spinner /> : "Save changes"}
      </Button>
    </form>
  );
}
