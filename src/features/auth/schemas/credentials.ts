import { z } from "zod";

const email = z.string().min(1, "Email is required").email("Enter a valid email").toLowerCase().trim();
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be 72 characters or fewer");

export const signUpSchema = z.object({
  email,
  password,
  fullName: z.string().trim().min(1, "Your name is required").max(100),
});

export const signInWithPasswordSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const sendOtpSchema = z.object({
  email,
});

export const verifyOtpSchema = z.object({
  email,
  token: z
    .string()
    .trim()
    .regex(/^\d{6,10}$/u, "Enter the code from your email"),
});

export const forgotPasswordSchema = z.object({
  email,
});

export const resetPasswordSchema = z.object({
  password,
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInWithPasswordInput = z.infer<typeof signInWithPasswordSchema>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
