import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminPartnersPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== "admin") redirect("/partner/login");

  const { data: partners } = await supabase
    .from("partners")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen px-6 py-16 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">All Partners</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="pb-3">Name</th>
            <th className="pb-3">Email</th>
            <th className="pb-3">Phone</th>
            <th className="pb-3">Slug</th>
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
