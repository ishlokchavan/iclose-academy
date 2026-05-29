import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { SignOutButton } from "../../partner/sign-out-button";

export default async function AdminPartnersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/partner/login");
  if (user.role !== "admin" && user.role !== "manager") redirect("/partner/login");

  const supabase = await createSupabaseServerClient();
  const { data: partners } = await supabase
    .from("partners")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen px-6 py-16 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">All Partners</h1>
        <SignOutButton />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="pb-3">Name</th>
            <th className="pb-3">Email</th>
            <th className="pb-3">Phone</th>
            <th className="pb-3">Code</th>
            <th className="pb-3">Joined</th>
          </tr>
        </thead>
        <tbody>
          {partners?.map((p) => (
            <tr key={p.id} className="border-b hover:bg-gray-50">
              <td className="py-3">{p.name}</td>
              <td className="py-3">{p.email}</td>
              <td className="py-3">{p.phone}</td>
              <td className="py-3 font-mono text-xs">iclose.ae/ref/{p.code}</td>
              <td className="py-3 text-gray-400">
                {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
