import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/patterns/PageHeader";
import { UsersPage } from "@/features/staff/components/UsersPage";
import { getAllUsers } from "@/features/staff/server/user-queries";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Users — iClose Academy" };

export default async function ManageUsersPage() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/manage");

  const users = await getAllUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Users"
        description="Manage accounts, roles, and team members across the platform."
      />
      <UsersPage users={users} selfId={user.id} />
    </div>
  );
}
