import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/patterns/PageHeader";
import { UserRoleSelect } from "@/features/staff/components/UserRoleSelect";
import { getAllUsers } from "@/features/staff/server/user-queries";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Users" };

export default async function ManageUsersPage() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/manage");
  const users = await getAllUsers();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Users"
        description="Manage user roles across the platform."
      />

      <div className="overflow-hidden rounded-2xl border border-hairline bg-surface-raised shadow-card">
        <table className="w-full">
          <thead className="border-b border-hairline bg-surface-subtle/50 text-left">
            <tr>
              <th className="px-5 py-3.5 eyebrow text-ink-muted font-medium">User</th>
              <th className="hidden px-5 py-3.5 eyebrow text-ink-muted font-medium md:table-cell">Joined</th>
              <th className="px-5 py-3.5 eyebrow text-right text-ink-muted font-medium">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-full border border-hairline bg-surface-subtle text-[12px] font-semibold text-ink">
                      {(u.full_name ?? u.email ?? "U")
                        .split(" ")
                        .map((p) => p[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium text-ink">{u.full_name ?? "(no name)"}</p>
                      <p className="truncate text-[12px] text-ink-muted">{u.email ?? "—"}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-5 py-4 text-[13px] text-ink-muted md:table-cell">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-4 text-right">
                  <UserRoleSelect userId={u.id} initialRole={u.role} selfId={user.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
