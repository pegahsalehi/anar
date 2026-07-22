"use server";

import { revalidatePath } from "next/cache";
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
type ProfileOperation =
  | "auth.getUser"
  | "profiles.select"
  | "profiles.update"
  | "profiles.upsert";
type NormalizedSupabaseError = {
  code?: string;
  details?: string | null;
  hint?: string | null;
  message: string;
  name?: string;
  status?: number;
};

const SESSION_EXPIRED_MESSAGE = "Your session has expired. Please sign in again.";
const PROFILE_PERMISSION_ERROR_MESSAGE =
  "Your profile could not be updated because of a database permission error.";
const PROFILE_DATA_INCOMPLETE_MESSAGE =
  "Your profile could not be saved because the profile data is incomplete.";
const PROFILE_GENERIC_SAVE_ERROR_MESSAGE = "Your profile could not be saved. Please try again.";

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
    if (authError) {
      logProfileOperationError("auth.getUser", authError);
    }

    return {
      status: "error",
      message: SESSION_EXPIRED_MESSAGE,
      fieldErrors: {},
    };
  }

  const profileResult = await supabase
    .from("profiles")
    .select("avatar_id, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileResult.error) {
    logProfileOperationError("profiles.select", profileResult.error, {
      userId: user.id,
    });

    return {
      status: "error",
      message: getProfilePersistenceErrorMessage(profileResult.error),
      fieldErrors: {},
    };
  }

  const currentProfile = profileResult.data as ProfileRow | null;
  const currentDisplayName = getDisplayName(
    currentProfile?.display_name,
    user.user_metadata?.display_name,
  );
  const currentAvatarId = normalizeAvatarId(currentProfile?.avatar_id);
  const profileChanged =
    parsed.data.displayName !== currentDisplayName || parsed.data.avatarId !== currentAvatarId;
  let profileUpdateError: string | null = null;
  let profileUpdated = false;

  let savedProfile: ProfileIdentityValues = {
    avatarId: currentAvatarId,
    displayName: currentDisplayName,
    email: user.email ?? "",
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
          .single()
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
          .single();

    if (saveResult.error || !saveResult.data) {
      const operation = currentProfile ? "profiles.update" : "profiles.upsert";
      const error = saveResult.error ?? {
        code: "PGRST116",
        message: "No matching profile row was saved.",
        status: 406,
      };
      logProfileOperationError(operation, error, {
        userId: user.id,
      });
      profileUpdateError = getProfilePersistenceErrorMessage(error);
    } else {
      const updatedProfile = saveResult.data as ProfileRow;
      savedProfile = {
        avatarId: normalizeAvatarId(updatedProfile.avatar_id),
        displayName: getDisplayName(updatedProfile.display_name, user.user_metadata?.display_name),
        email: user.email ?? "",
      };
      profileUpdated = true;
    }
  }

  if (profileUpdateError) {
    if (profileUpdated) {
      revalidateProfileIdentityPaths();
    }

    return {
      status: "error",
      message: profileUpdateError,
      fieldErrors: {},
      profile: profileUpdated ? savedProfile : undefined,
      profileError: profileUpdateError,
      profileUpdated,
    };
  }

  revalidateProfileIdentityPaths();

  return {
    status: "success",
    message: "Profile saved.",
    fieldErrors: {},
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
  return value === "displayName" || value === "avatarId";
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

function revalidateProfileIdentityPaths() {
  revalidatePath("/profile");
  revalidatePath("/foods");
  revalidatePath("/settings");
  revalidatePath("/today");
  revalidatePath("/history");
}

function getProfilePersistenceErrorMessage(error: unknown) {
  const normalized = normalizeSupabaseError(error);
  const code = normalized.code?.toUpperCase();
  const searchable = [
    normalized.message,
    normalized.details,
    normalized.hint,
    normalized.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    code === "42501" ||
    searchable.includes("row-level security") ||
    searchable.includes("permission denied") ||
    searchable.includes("insufficient privilege")
  ) {
    return PROFILE_PERMISSION_ERROR_MESSAGE;
  }

  if (
    code === "23502" ||
    code === "23503" ||
    code === "23514" ||
    code === "42703" ||
    searchable.includes("not-null") ||
    searchable.includes("null value") ||
    searchable.includes("check constraint") ||
    searchable.includes("foreign key") ||
    searchable.includes("schema cache") ||
    (searchable.includes("column") && searchable.includes("does not exist"))
  ) {
    return PROFILE_DATA_INCOMPLETE_MESSAGE;
  }

  return PROFILE_GENERIC_SAVE_ERROR_MESSAGE;
}

function logProfileOperationError(
  operation: ProfileOperation,
  error: unknown,
  details: {
    userId?: string;
  } = {},
) {
  if (process.env.NODE_ENV !== "production") {
    const normalized = normalizeSupabaseError(error);

    console.error(`[profile:saveIdentity] ${operation} failed`, {
      operation,
      code: normalized.code,
      message: normalized.message,
      details: normalized.details,
      hint: normalized.hint,
      status: normalized.status,
      name: normalized.name,
      userId: details.userId,
      error,
    });
  }
}

function normalizeSupabaseError(error: unknown): NormalizedSupabaseError {
  if (typeof error === "string") {
    return {
      message: error,
    };
  }

  if (!error || typeof error !== "object") {
    return {
      message: "Unknown Supabase error",
    };
  }

  const record = error as Record<string, unknown>;

  return {
    code: readString(record.code),
    details: readNullableString(record.details),
    hint: readNullableString(record.hint),
    message: readString(record.message) ?? "Unknown Supabase error",
    name: readString(record.name),
    status: readNumber(record.status),
  };
}

function readString(value: unknown) {
  return typeof value === "string" && value ? value : undefined;
}

function readNullableString(value: unknown) {
  if (value === null) {
    return null;
  }

  return readString(value);
}

function readNumber(value: unknown) {
  return typeof value === "number" ? value : undefined;
}
