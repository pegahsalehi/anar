import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email.")
  .email("Enter a valid email address.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
  next: z.string().optional(),
});

export const signupSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(80, "Display name must be 80 characters or fewer.")
    .optional(),
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters."),
  timezone: z.string().trim().min(1).max(100).optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
});
