import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email.")
  .email("Enter a valid email address.");

export const termsAcceptanceMessage =
  "Please review and accept the Terms of Use before creating an account.";

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
  next: z.string().optional(),
});

export const signupSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, "Enter your first name.")
      .max(80, "First name must be 80 characters or fewer."),
    email: emailSchema,
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
    termsAccepted: z
      .any()
      .refine((value) => value === "on" || value === "true" || value === true, {
        message: termsAcceptanceMessage,
      }),
    timezone: z.string().trim().min(1).max(100).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
});
