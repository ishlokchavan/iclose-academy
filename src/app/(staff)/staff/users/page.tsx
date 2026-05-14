import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/patterns/PageHeader";
import { UserRoleSelect } from "@/features/staff/components/UserRoleSelect";
import { getAllUsers } from "@/features/staff/server/user-queries";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Users · Staff" };

export default async function StaffUsersPage() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/staff");
  const users = await getAllUsers();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Users"
        description="Promote learners to educators, or grant staff access."
      />

      <div className="overflow-hidden rounded-lg border border-hairline bg-surface-raised">
        <table className="w-full">
          <thead className="border-b border-hairline bg-surface-subtle/50 text-left text-[11px] font-mono uppercase tracking-widest text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Joined</th>
              <th className="px-4 py-3 text-right font-medium">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-full border border-hairline bg-surface-subtle text-xs font-semibold text-ink">
                      {(u.full_name ?? u.email ?? "U")
                        .split(" ")
                        .map((p) => p[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {u.full_name ?? "(no name)"}
                      </p>
                      <p className="truncate text-xs text-ink-muted">
                        {u.email ?? <span className="italic">email hidden</span>}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-sm text-ink-muted md:table-cell">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
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
