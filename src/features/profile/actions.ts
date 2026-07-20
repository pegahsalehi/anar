"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { normalizeAvatarId } from "@/features/profile/avatar-options";
import { profileIdentitySchema } from "@/features/profile/schemas";
import type {
  ProfileIdentityActionState,
  ProfileIdentityField,
  ProfileIdentityValues,
} from "@/features/profile/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type ProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "avatar_id" | "display_name"
>;

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
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      status: "error",
      message: authError
        ? "Your session could not be verified. Please log in again."
        : "You must be signed in to update your profile.",
      fieldErrors: {},
    };
  }

  const currentEmail = normalizeEmail(user.email);

  if (!currentEmail) {
    return {
      status: "error",
      message: "Your account email could not be loaded. Please log in again.",
      fieldErrors: {
        email: "Your active account email could not be loaded.",
      },
    };
  }

  const profileResult = await supabase
    .from("profiles")
    .select("avatar_id, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileResult.error) {
    logProfileActionError("[profile:saveIdentity] profiles.select failed", {
      error: profileResult.error,
      userId: user.id,
    });

    return {
      status: "error",
      message: "Profile could not be loaded. Please try again.",
      fieldErrors: {},
    };
  }

  const currentProfile = profileResult.data as ProfileRow | null;
  const currentDisplayName = getDisplayName(
    currentProfile?.display_name,
    user.user_metadata?.display_name,
  );
  const currentAvatarId = normalizeAvatarId(currentProfile?.avatar_id);
  const emailChanged = parsed.data.email !== currentEmail;
  const profileChanged =
    parsed.data.displayName !== currentDisplayName || parsed.data.avatarId !== currentAvatarId;
  let activeEmail = user.email ?? "";
  let emailConfirmationRequired = false;
  let emailUpdateError: string | null = null;
  let profileUpdateError: string | null = null;
  let profileUpdated = false;

  let savedProfile: ProfileIdentityValues = {
    avatarId: currentAvatarId,
    displayName: currentDisplayName,
    email: activeEmail,
  };

  if (profileChanged) {
    const profileValues = {
      avatar_id: parsed.data.avatarId,
      display_name: parsed.data.displayName,
    } satisfies ProfileUpdate;

    const saveResult = currentProfile
      ? await supabase
          .from("profiles")
          .update(profileValues)
          .eq("id", user.id)
          .select("avatar_id, display_name")
          .maybeSingle()
      : await supabase
          .from("profiles")
          .upsert(
            {
              id: user.id,
              ...profileValues,
            } satisfies ProfileInsert,
            { onConflict: "id" },
          )
          .select("avatar_id, display_name")
          .maybeSingle();

    if (saveResult.error || !saveResult.data) {
      const operation = currentProfile ? "profiles.update" : "profiles.upsert";
      logProfileActionError(`[profile:saveIdentity] ${operation} failed`, {
        error: saveResult.error ?? "No matching profile row was saved.",
        userId: user.id,
      });
      profileUpdateError = currentProfile
        ? "Display name and avatar could not be saved."
        : "Your profile record could not be created. Please sign out and back in, then try again.";
    } else {
      const updatedProfile = saveResult.data as ProfileRow;
      savedProfile = {
        avatarId: normalizeAvatarId(updatedProfile.avatar_id),
        displayName: getDisplayName(updatedProfile.display_name, user.user_metadata?.display_name),
        email: activeEmail,
      };
      profileUpdated = true;
    }
  }

  if (emailChanged) {
    const origin = await getRequestOrigin();
    const { data, error: emailError } = await supabase.auth.updateUser(
      {
        email: parsed.data.email,
      },
      {
        emailRedirectTo: `${origin}/auth/callback?next=/profile`,
      },
    );

    if (emailError) {
      logProfileActionError("[profile:saveIdentity] auth.updateUser email failed", {
        error: emailError,
        userId: user.id,
      });
      emailUpdateError = translateEmailUpdateError(emailError.message);
    } else {
      const returnedEmail = normalizeEmail(data.user?.email);
      emailConfirmationRequired = returnedEmail !== parsed.data.email;
      activeEmail = emailConfirmationRequired
        ? user.email ?? ""
        : (data.user?.email ?? parsed.data.email);
      savedProfile = {
        ...savedProfile,
        email: activeEmail,
      };
    }
  }

  if (profileUpdateError || emailUpdateError) {
    const fieldErrors: ProfileIdentityActionState["fieldErrors"] = {};

    if (emailUpdateError) {
      fieldErrors.email = emailUpdateError;
    }

    if (profileUpdated || (emailChanged && !emailUpdateError)) {
      revalidateProfileIdentityPaths();
    }

    return {
      status: "error",
      message: getSaveErrorMessage({
        emailUpdateError,
        profileUpdateError,
        profileUpdated,
      }),
      fieldErrors,
      emailError: emailUpdateError,
      profile: profileUpdated ? savedProfile : undefined,
      profileError: profileUpdateError,
      profileUpdated,
    };
  }

  revalidateProfileIdentityPaths();

  return {
    status: "success",
    message: emailConfirmationRequired
      ? "Check your new email address to confirm the change."
      : "Profile saved.",
    fieldErrors: {},
    emailConfirmationRequired,
    profile: savedProfile,
    profileUpdated,
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
  return value === "displayName" || value === "email" || value === "avatarId";
}

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function getDisplayName(profileName: string | null | undefined, metadataName: unknown) {
  const storedName = profileName?.trim();

  if (storedName) {
    return storedName;
  }

  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName.trim();
  }

  return "User";
}

function translateEmailUpdateError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("already") || normalized.includes("registered")) {
    return "An account already exists for this email.";
  }

  if (normalized.includes("invalid") || normalized.includes("email")) {
    return "Enter a valid email address.";
  }

  if (
    normalized.includes("session") ||
    normalized.includes("jwt") ||
    normalized.includes("token") ||
    normalized.includes("expired")
  ) {
    return "Your session has expired. Please log in again.";
  }

  if (normalized.includes("reauthentication") || normalized.includes("recent")) {
    return "Please log in again before changing your email.";
  }

  return "Email could not be updated. Please try again.";
}

async function getRequestOrigin() {
  const headerStore = await headers();
  return headerStore.get("origin") ?? "http://localhost:3000";
}

function revalidateProfileIdentityPaths() {
  revalidatePath("/profile");
  revalidatePath("/foods");
  revalidatePath("/settings");
  revalidatePath("/today");
  revalidatePath("/history");
}

function getSaveErrorMessage({
  emailUpdateError,
  profileUpdateError,
  profileUpdated,
}: {
  emailUpdateError: string | null;
  profileUpdateError: string | null;
  profileUpdated: boolean;
}) {
  if (profileUpdateError && emailUpdateError) {
    return "Profile details and email could not be saved.";
  }

  if (profileUpdateError) {
    return profileUpdateError;
  }

  if (profileUpdated) {
    return "Profile details saved, but email could not be updated.";
  }

  return "Email could not be updated.";
}

function logProfileActionError(
  label: string,
  details: {
    error: unknown;
    userId: string;
  },
) {
  if (process.env.NODE_ENV !== "production") {
    console.error(label, details);
  }
}
