"use server";

import { requireMinRole } from "@/lib/auth/guards";

import { getAffiliateById } from "./queries";
import type { AffiliateDetail } from "./queries";

export async function loadAffiliateDetailAction(leadId: string): Promise<AffiliateDetail | null> {
  await requireMinRole("manager");
  return getAffiliateById(leadId);
}
