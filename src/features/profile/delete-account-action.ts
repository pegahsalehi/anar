"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { foodImagesBucket } from "@/lib/storage/food-images";
import type { DeleteAccountActionState } from "@/features/profile/types";
import type { Database } from "@/types/database";

type ServerSupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;
type AdminSupabaseClient = ReturnType<typeof createSupabaseAdminClient>;
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
type StorageListItem = {
  id?: string | null;
  metadata?: unknown;
  name: string;
  owner?: string | null;
};

const deleteConfirmation = "DELETE";
const storageListPageSize = 100;
const storageRemoveBatchSize = 100;
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

  const listedStoragePathsResult = await listAccountOwnedStoragePaths(adminSupabase, user.id);

  if (!listedStoragePathsResult.ok) {
    return deleteAccountError(storageCleanupMessage);
  }

  const storagePathsToRemove = getStoragePathsToRemove({
    databasePaths: storagePathsResult.paths,
    listedOwnedPaths: listedStoragePathsResult.paths,
    userId: user.id,
  });
  const storageRemoveResult = await removeAccountStoragePaths(
    adminSupabase,
    storagePathsToRemove,
    user.id,
  );

  if (!storageRemoveResult.ok) {
    return deleteAccountError(storageCleanupMessage);
  }

  const { error: deleteUserError } = await adminSupabase.auth.admin.deleteUser(user.id, false);

  if (deleteUserError) {
    logDeleteAccountError("auth.admin.deleteUser", deleteUserError, {
      userId: user.id,
    });

    return deleteAccountError(authDeletionMessage);
  }

  const { error: signOutError } = await supabase.auth.signOut({ scope: "global" });

  if (signOutError) {
    logDeleteAccountError("auth.signOut", signOutError, {
      userId: user.id,
    });
  }

  redirect("/login?deleted=1");
}

async function listAccountOwnedStoragePaths(
  supabase: AdminSupabaseClient,
  userId: string,
): Promise<{ ok: true; paths: string[] } | { ok: false }> {
  const bucket = supabase.storage.from(foodImagesBucket);
  const paths: string[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await bucket.list(userId, {
      limit: storageListPageSize,
      offset,
      sortBy: {
        column: "name",
        order: "asc",
      },
    });

    if (error) {
      logDeleteAccountError("storage.list", error, { userId });
      return { ok: false };
    }

    const items = (data ?? []) as StorageListItem[];

    items.forEach((item) => {
      const path = `${userId}/${item.name}`;

      if (isOwnedStoragePath(userId, path) && item.owner === userId && isStorageFile(item)) {
        paths.push(path);
      }
    });

    if (items.length < storageListPageSize) {
      break;
    }

    offset += storageListPageSize;
  }

  return {
    ok: true,
    paths: dedupeStoragePaths(paths),
  };
}

function getStoragePathsToRemove({
  databasePaths,
  listedOwnedPaths,
  userId,
}: {
  databasePaths: string[];
  listedOwnedPaths: string[];
  userId: string;
}) {
  const listedOwnedPathSet = new Set(listedOwnedPaths);
  const verifiedDatabasePaths = databasePaths.filter((path) => listedOwnedPathSet.has(path));

  return dedupeStoragePaths(
    [...listedOwnedPaths, ...verifiedDatabasePaths].filter((path) =>
      isOwnedStoragePath(userId, path),
    ),
  );
}

async function removeAccountStoragePaths(
  supabase: AdminSupabaseClient,
  paths: string[],
  userId: string,
): Promise<{ ok: true } | { ok: false }> {
  if (paths.length === 0) {
    return { ok: true };
  }

  const bucket = supabase.storage.from(foodImagesBucket);

  for (let index = 0; index < paths.length; index += storageRemoveBatchSize) {
    const batch = paths.slice(index, index + storageRemoveBatchSize);
    const { error } = await bucket.remove(batch);

    if (error) {
      logDeleteAccountError("storage.remove", error, {
        userId,
      });

      return { ok: false };
    }
  }

  return { ok: true };
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
  return dedupeStoragePaths(
    paths.filter((path): path is string => isOwnedStoragePath(userId, path)),
  );
}

function isOwnedStoragePath(userId: string, path: unknown): path is string {
  if (typeof path !== "string") {
    return false;
  }

  const segments = path.split("/");

  return (
    segments.length >= 2 &&
    segments[0] === userId &&
    segments.every((segment) => segment.length > 0 && segment !== "." && segment !== "..")
  );
}

function isStorageFile(item: StorageListItem) {
  return Boolean(item.id || item.metadata);
}

function dedupeStoragePaths(paths: string[]) {
  return Array.from(new Set(paths));
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
