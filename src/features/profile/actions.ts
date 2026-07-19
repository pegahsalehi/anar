"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { profileIdentitySchema } from "@/features/profile/schemas";
import type {
  ProfileIdentityActionState,
  ProfileIdentityField,
} from "@/features/profile/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export async function saveProfileIdentityAction(
  _previousState: ProfileIdentityActionState,
  formData: FormData,
): Promise<ProfileIdentityActionState> {
  const parsed = profileIdentitySchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return profileIdentityValidationError(parsed.error);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "You must be signed in to update your profile.",
      fieldErrors: {},
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      avatar_id: parsed.data.avatarId,
      display_name: parsed.data.displayName,
    } satisfies ProfileUpdate)
    .eq("id", user.id);

  if (error) {
    console.error("[profile:saveIdentity] profiles.update failed", {
      message: error.message ?? null,
      userId: user.id,
    });

    return {
      status: "error",
      message: "Profile could not be saved. Please try again.",
      fieldErrors: {},
    };
  }

  revalidatePath("/profile");
  revalidatePath("/settings");
  revalidatePath("/today");
  revalidatePath("/history");

  return {
    status: "success",
    message: "Profile saved.",
    fieldErrors: {},
  };
}

function profileIdentityValidationError(error: z.ZodError): ProfileIdentityActionState {
  const fieldErrors: ProfileIdentityActionState["fieldErrors"] = {};

  error.issues.forEach((issue) => {
    const field = issue.path[0];

    if (isProfileIdentityField(field) && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  });

  return {
    status: "error",
    message: "Please fix the highlighted fields.",
    fieldErrors,
  };
}

function isProfileIdentityField(value: unknown): value is ProfileIdentityField {
  return value === "displayName" || value === "avatarId";
}
