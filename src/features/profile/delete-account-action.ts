"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { foodImagesBucket } from "@/lib/storage/food-images";
import type { DeleteAccountActionState } from "@/features/profile/types";
import type { Database } from "@/types/database";

type ServerSupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;
type SupabaseErrorLike = {
  code?: string;
  details?: string | null;
  hint?: string | null;
  message?: string;
  name?: string;
  status?: number;
};
type ProfileStorageRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "avatar_path">;
type FoodStorageRow = Pick<Database["public"]["Tables"]["foods"]["Row"], "image_path">;
type FoodLogStorageRow = Pick<
  Database["public"]["Tables"]["food_logs"]["Row"],
  "image_path_snapshot"
>;

const deleteConfirmation = "DELETE";
const invalidConfirmationMessage = "Type DELETE to confirm account deletion.";
const expiredSessionMessage = "Your session has expired. Please sign in again.";
const databaseCleanupMessage =
  "Account data could not be prepared for deletion. Please try again.";
const storageCleanupMessage = "Uploaded files could not be deleted. Please try again.";
const authDeletionMessage = "Account could not be deleted. Please try again.";

export async function deleteAccountAction(
  _previousState: DeleteAccountActionState,
  formData: FormData,
): Promise<DeleteAccountActionState> {
  const confirmation = String(formData.get("confirmation") ?? "");

  if (confirmation !== deleteConfirmation) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: {
        confirmation: invalidConfirmationMessage,
      },
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    if (authError) {
      logDeleteAccountError("auth.getUser", authError);
    }

    return deleteAccountError(expiredSessionMessage);
  }

  const storagePathsResult = await getAccountStoragePaths(supabase, user.id);

  if (!storagePathsResult.ok) {
    return deleteAccountError(databaseCleanupMessage);
  }

  let adminSupabase: ReturnType<typeof createSupabaseAdminClient>;

  try {
    adminSupabase = createSupabaseAdminClient();
  } catch (error) {
    logDeleteAccountError("admin.createClient", error);
    return deleteAccountError(authDeletionMessage);
  }

  if (storagePathsResult.paths.length > 0) {
    const { error: storageError } = await adminSupabase.storage
      .from(foodImagesBucket)
      .remove(storagePathsResult.paths);

    if (storageError) {
      logDeleteAccountError("storage.remove", storageError, {
        userId: user.id,
      });

      return deleteAccountError(storageCleanupMessage);
    }
  }

  const { error: deleteUserError } = await adminSupabase.auth.admin.deleteUser(user.id, false);

  if (deleteUserError) {
    logDeleteAccountError("auth.admin.deleteUser", deleteUserError, {
      userId: user.id,
    });

    return deleteAccountError(authDeletionMessage);
  }

  const { error: signOutError } = await supabase.auth.signOut();

  if (signOutError) {
    logDeleteAccountError("auth.signOut", signOutError, {
      userId: user.id,
    });
  }

  redirect("/login?deleted=1");
}

async function getAccountStoragePaths(
  supabase: ServerSupabaseClient,
  userId: string,
): Promise<{ ok: true; paths: string[] } | { ok: false }> {
  const [profileResult, foodsResult, logsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("avatar_path")
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("foods").select("image_path").eq("user_id", userId),
    supabase.from("food_logs").select("image_path_snapshot").eq("user_id", userId),
  ]);

  const failures = [
    ["profiles.selectStoragePaths", profileResult.error],
    ["foods.selectStoragePaths", foodsResult.error],
    ["food_logs.selectStoragePaths", logsResult.error],
  ] as const;

  failures.forEach(([operation, error]) => {
    if (error) {
      logDeleteAccountError(operation, error, { userId });
    }
  });

  if (failures.some(([, error]) => Boolean(error))) {
    return { ok: false };
  }

  return {
    ok: true,
    paths: getOwnedStoragePaths(userId, [
      (profileResult.data as ProfileStorageRow | null)?.avatar_path,
      ...((foodsResult.data ?? []) as FoodStorageRow[]).map((food) => food.image_path),
      ...((logsResult.data ?? []) as FoodLogStorageRow[]).map(
        (log) => log.image_path_snapshot,
      ),
    ]),
  };
}

function getOwnedStoragePaths(userId: string, paths: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      paths.filter(
        (path): path is string =>
          typeof path === "string" &&
          path.length > 0 &&
          path.split("/")[0] === userId,
      ),
    ),
  );
}

function deleteAccountError(message: string): DeleteAccountActionState {
  return {
    status: "error",
    message,
    fieldErrors: {},
  };
}

function logDeleteAccountError(
  operation: string,
  error: unknown,
  details: {
    userId?: string;
  } = {},
) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  const normalized = normalizeSupabaseError(error);

  console.error("[profile:deleteAccount] operation failed", {
    operation,
    code: normalized.code,
    message: normalized.message,
    details: normalized.details,
    hint: normalized.hint,
    status: normalized.status,
    name: normalized.name,
    userId: details.userId,
  });
}

function normalizeSupabaseError(error: unknown): SupabaseErrorLike {
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
