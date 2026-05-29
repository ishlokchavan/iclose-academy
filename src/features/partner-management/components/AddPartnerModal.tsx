"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { createPartnerAction } from "@/features/partner-management/server/actions";

export function AddPartnerModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", code: "" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createPartnerAction(form);
      if (result.error) {
        setError(result.error);
        return;
      }
      setForm({ name: "", email: "", phone: "", code: "" });
      onClose();
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-hairline bg-background p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200">
          <Dialog.Title className="text-[17px] font-semibold text-ink">Add partner</Dialog.Title>
          <Dialog.Description className="mt-1 text-[13px] text-ink-muted">
            Create a partner record. They&apos;ll get a referral code right away.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="code">Referral code <span className="text-ink-muted">(optional — auto if blank)</span></Label>
              <Input id="code" name="code" value={form.code} onChange={handleChange} placeholder="e.g. acme" />
            </div>

            {error ? (
              <p className="text-[13px] text-destructive" role="alert">{error}</p>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Spinner /> : "Create"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
