"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function PartnerLoginPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const { data, error: signInError } = await supabase.auth.signInWithPassword(form);
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    const role = data.user?.user_metadata?.role;
    if (role === "partner") router.push("/partner/dashboard");
    else if (role === "admin") router.push("/admin/partners");
    else {
      setError("Unauthorized");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold">Partner Login</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          className="w-full border px-4 py-3 rounded-lg"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="w-full border px-4 py-3 rounded-lg"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:opacity-80 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </main>
  );
}
