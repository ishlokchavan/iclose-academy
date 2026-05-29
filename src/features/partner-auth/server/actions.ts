"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { partnerProfileSchema } from "@/features/partner-auth/schemas/partner-profile";

export type PartnerProfileState =
  | { error: string }
  | { success: string }
  | null;

export async function updatePartnerProfileAction(
  _prev: PartnerProfileState,
  formData: FormData,
): Promise<PartnerProfileState> {
  const user = await getSessionUser();
  if (!user || user.role !== "partner") {
    return { error: "Not authorized." };
  }

  const parsed = partnerProfileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // partners RLS has no UPDATE policy by design — go through admin client
  // and enforce ownership ourselves (user_id must match the session user).
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("partners")
    .update({ name: parsed.data.name, phone: parsed.data.phone })
    .eq("user_id", user.id);
  if (error) return { error: "Could not save your changes." };

  revalidatePath("/partner/profile");
  revalidatePath("/partner/dashboard");
  return { success: "Saved." };
}
