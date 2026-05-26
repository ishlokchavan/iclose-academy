import "server-only";

import { cookies } from "next/headers";

import { REF_COOKIE, normalizeCode } from "../constants";

/** Read & normalize the referral code cookie from the current request. */
export async function readReferralCookie(): Promise<string | null> {
  const jar = await cookies();
  return normalizeCode(jar.get(REF_COOKIE)?.value);
}
