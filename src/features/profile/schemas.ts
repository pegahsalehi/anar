import { z } from "zod";
import { avatarIds } from "@/features/profile/avatar-options";

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
  avatarId: z.enum(avatarIds, {
    error: "Choose one of the available avatars.",
  }),
});
