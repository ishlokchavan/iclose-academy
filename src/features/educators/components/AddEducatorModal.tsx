"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { createEducatorAction } from "@/features/educators/server/actions";

export function AddEducatorModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    expertise: "",
    bio: "",
    photo_url: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createEducatorAction(form);
      if (result.error) { setError(result.error); return; }
      setForm({ first_name: "", last_name: "", email: "", phone: "", expertise: "", bio: "", photo_url: "" });
      onClose();
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-hairline bg-background p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200">
          <Dialog.Title className="text-[17px] font-semibold text-ink">Add educator</Dialog.Title>
          <Dialog.Description className="mt-1 text-[13px] text-ink-muted">
            Educators appear on topic cards and detail pages.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium text-ink">First name</Label>
                <Input name="first_name" value={form.first_name} onChange={handleChange} required placeholder="First" disabled={isPending} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium text-ink">Last name</Label>
                <Input name="last_name" value={form.last_name} onChange={handleChange} required placeholder="Last" disabled={isPending} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-ink">Email</Label>
              <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="name@company.ae" disabled={isPending} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-ink">Phone</Label>
              <Input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+971 50 123 4567" disabled={isPending} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-ink">Expertise <span className="text-ink-muted font-normal">(optional)</span></Label>
              <Input name="expertise" value={form.expertise} onChange={handleChange} placeholder="e.g. Luxury Residential" disabled={isPending} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-ink">Bio <span className="text-ink-muted font-normal">(optional)</span></Label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={2}
                placeholder="Short bio…"
                disabled={isPending}
                className="flex w-full rounded-lg border border-hairline bg-surface-raised px-4 py-2.5 text-[14px] text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-[12px] text-red-600">{error}</p>
            )}

            <div className="flex gap-2 pt-1">
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? <Spinner /> : "Add educator"}
              </Button>
              <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>Cancel</Button>
            </div>
          </form>

          <Dialog.Close className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-subtle hover:text-ink">
            <X className="size-4" aria-hidden />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
