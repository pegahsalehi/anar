import { z } from "zod";
import { avatarIds } from "@/features/profile/avatar-options";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email.")
  .email("Enter a valid email address.")
  .transform((value) => value.toLowerCase());

export const profileIdentitySchema = z.object({
  displayName: z
    .string()
    .transform((value) => value.trim())
    .pipe(
      z
        .string()
        .min(2, "Display name must be at least 2 characters.")
        .max(30, "Display name must be 30 characters or fewer."),
    ),
  email: emailSchema,
  avatarId: z.enum(avatarIds, {
    error: "Choose one of the available avatars.",
  }),
});
