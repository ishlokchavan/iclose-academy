"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Spinner } from "@/components/ui/spinner";
import { setUserRoleAction } from "@/features/staff/server/user-actions";

type Role = "learner" | "educator" | "content_manager" | "manager" | "admin";

export function UserRoleSelect({
  userId,
  initialRole,
  selfId,
}: {
  userId: string;
  initialRole: Role;
  selfId: string;
}) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(initialRole);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isSelf = userId === selfId;

  function onChange(next: Role) {
    if (next === role) return;
    const prev = role;
    setError(null);
    setRole(next);
    startTransition(async () => {
      const res = await setUserRoleAction(userId, next);
      if (res.error) {
        setRole(prev);
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="flex items-center gap-1.5">
        <select
          value={role}
          onChange={(e) => onChange(e.target.value as Role)}
          disabled={pending || isSelf}
          aria-label="Role"
          className="h-9 rounded-md border border-hairline bg-surface-raised px-2.5 text-sm text-ink disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:border-accent"
        >
          <option value="learner">Learner</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        {pending ? <Spinner className="size-3.5 text-ink-muted" /> : null}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {isSelf ? <p className="text-[10px] text-ink-muted">That's you</p> : null}
    </div>
  );
}
