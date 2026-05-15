"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { inviteUserAction } from "@/features/staff/server/user-actions";

type State = { error?: string; success?: boolean } | null;

async function wrappedInvite(prev: State, fd: FormData): Promise<State> {
  const email = fd.get("email") as string;
  const fullName = fd.get("fullName") as string;
  const role = fd.get("role") as "manager" | "content_manager";
  return inviteUserAction(email, fullName, role);
}

export function InviteUserModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<State, FormData>(
    async (prev, fd) => {
      const res = await wrappedInvite(prev, fd);
      if (!res?.error) {
        router.refresh();
        onClose();
      }
      return res;
    },
    null,
  );

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-hairline bg-background p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200">
          <Dialog.Title className="text-[17px] font-semibold text-ink">Invite team member</Dialog.Title>
          <Dialog.Description className="mt-1 text-[13px] text-ink-muted">
            They'll receive an email with a link to set their password.
          </Dialog.Description>

          <form action={action} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="inv-name" className="text-[13px] font-medium text-ink">Full name</Label>
              <Input id="inv-name" name="fullName" type="text" required placeholder="Sarah Al-Mansouri" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-email" className="text-[13px] font-medium text-ink">Email</Label>
              <Input id="inv-email" name="email" type="email" required autoComplete="off" placeholder="sarah@company.ae" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-role" className="text-[13px] font-medium text-ink">Role</Label>
              <select
                id="inv-role"
                name="role"
                defaultValue="manager"
                className="h-9 w-full rounded-md border border-hairline bg-surface-raised px-2.5 text-[14px] text-ink focus:outline-none focus:border-accent"
              >
                <option value="manager">Manager</option>
                <option value="content_manager">Content Manager</option>
              </select>
            </div>

            {state?.error ? (
              <p className="text-[13px] text-destructive" role="alert">{state.error}</p>
            ) : null}

            <div className="flex gap-2 pt-1">
              <Button type="submit" className="flex-1" disabled={pending}>
                {pending ? <Spinner /> : "Send invitation"}
              </Button>
              <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
                Cancel
              </Button>
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
