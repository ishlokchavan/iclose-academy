"use server";

import { createHash, randomInt } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ROLE_LANDING } from "@/config/nav";
import { sendOtpEmail } from "@/lib/email/send-otp-email";
import { sendResetEmail } from "@/lib/email/send-reset-email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  sendOtpSchema,
  signInWithPasswordSchema,
  signUpSchema,
  verifyOtpSchema,
} from "@/features/auth/schemas/credentials";
import type { Database } from "@/types/db";

export type ActionState = { error?: string; success?: string; nextEmail?: string } | null;

const safeNext = (raw: FormDataEntryValue | null) => {
  const value = typeof raw === "string" ? raw : "";
  return value.startsWith("/") && !value.startsWith("//") ? value : null;
};

async function getRoleLanding(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "/sign-in";
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = (profile?.role ?? "learner") as Database["public"]["Enums"]["app_role"];
  return ROLE_LANDING[role];
}

function hashCode(code: string, email: string): string {
  return createHash("sha256").update(`${code}:${email}`).digest("hex");
}

// ----------------------------------------------------------------------------
// Sign up with email + password
// ----------------------------------------------------------------------------
export async function signUpWithPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/callback`,
    },
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")) ?? await getRoleLanding(supabase));
}

// ----------------------------------------------------------------------------
// Sign in with email + password
// ----------------------------------------------------------------------------
export async function signInWithPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signInWithPasswordSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")) ?? await getRoleLanding(supabase));
}

// ----------------------------------------------------------------------------
// Send a 6-digit OTP via Gmail SMTP (custom — does not use Supabase email)
// ----------------------------------------------------------------------------
export async function sendOtpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = sendOtpSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid email" };

  const { email } = parsed.data;
  const code = randomInt(100000, 1000000).toString();
  const codeHash = hashCode(code, email);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const admin = createSupabaseAdminClient();

  // Invalidate any existing unused OTPs for this email
  await admin
    .from("email_otps")
    .update({ consumed_at: new Date().toISOString() })
    .eq("email", email)
    .is("consumed_at", null);

  const { error: insertError } = await admin.from("email_otps").insert({
    email,
    code_hash: codeHash,
    expires_at: expiresAt,
  });
  if (insertError) return { error: "Failed to generate code. Please try again." };

  try {
    await sendOtpEmail(email, code);
  } catch {
    return { error: "Failed to send email. Please try again." };
  }

  return { success: "We sent a 6-digit code to your email.", nextEmail: email };
}

// ----------------------------------------------------------------------------
// Verify the OTP code → exchange for a Supabase session via admin magic link
// ----------------------------------------------------------------------------
export async function verifyOtpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = verifyOtpSchema.safeParse({
    email: formData.get("email"),
    token: formData.get("token"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid code" };

  const { email, token } = parsed.data;
  const codeHash = hashCode(token, email);
  const admin = createSupabaseAdminClient();

  // Find a valid, unconsumed OTP
  const { data: otp, error: lookupError } = await admin
    .from("email_otps")
    .select("id")
    .eq("email", email)
    .eq("code_hash", codeHash)
    .is("consumed_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (lookupError || !otp) {
    return { error: "Invalid or expired code. Request a new one." };
  }

  // Mark consumed
  await admin
    .from("email_otps")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", otp.id);

  const next = safeNext(formData.get("next"));

  // Generate a magic link server-side to get a short-lived token_hash,
  // then verify it directly on the server — this sets the session cookie
  // without any browser redirect through Supabase's servers (avoids the
  // redirect-URL whitelist requirement).
  const { data, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkError || !data?.properties?.action_link) {
    return { error: "Sign-in failed. Please try again." };
  }

  const tokenHash = new URL(data.properties.action_link).searchParams.get("token");
  if (!tokenHash) return { error: "Sign-in failed. Please try again." };

  const supabase = await createSupabaseServerClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "magiclink",
  });
  if (verifyError) return { error: "Sign-in failed. Please try again." };

  revalidatePath("/", "layout");
  redirect(next ?? await getRoleLanding(supabase));
}

// ----------------------------------------------------------------------------
// Forgot password — send reset link via Gmail SMTP
// ----------------------------------------------------------------------------
export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid email" };

  const { email } = parsed.data;
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/callback?next=/reset-password`;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });

  // Always return success to avoid email enumeration
  if (!error && data?.properties?.action_link) {
    try {
      await sendResetEmail(email, data.properties.action_link);
    } catch {
      // Silent — don't expose email send failures to the client
    }
  }

  return {
    success: "If an account exists for that email, we've sent a reset link.",
  };
}

// ----------------------------------------------------------------------------
// Reset password — user must be authenticated via a recovery session
// ----------------------------------------------------------------------------
export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(await getRoleLanding(supabase));
}

// ----------------------------------------------------------------------------
// Sign out
// ----------------------------------------------------------------------------
export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/sign-in");
}
