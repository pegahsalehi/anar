import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export const foodImagesBucket = "food-images";
export const maxFoodImageSizeBytes = 1024 * 1024;
export const allowedFoodImageTypes = ["image/jpeg", "image/png", "image/webp"] as const;

export type FoodImageFile = Blob & {
  name: string;
  size: number;
  type: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

export type FoodImageValidationResult =
  | { ok: true; file: FoodImageFile }
  | { ok: false; error: string };

const extensionByType: Record<(typeof allowedFoodImageTypes)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function validateFoodImage(file: FoodImageFile | null): FoodImageValidationResult {
  if (!file || file.size === 0) {
    return { ok: false, error: "Choose an image file." };
  }

  if (!allowedFoodImageTypes.includes(file.type as (typeof allowedFoodImageTypes)[number])) {
    return { ok: false, error: "Use a JPEG, PNG, or WebP image." };
  }

  if (file.size > maxFoodImageSizeBytes) {
    return { ok: false, error: "Images must be 1 MB or smaller." };
  }

  return { ok: true, file };
}

export function buildFoodImagePath(userId: string, mimeType: string) {
  const extension = extensionByType[mimeType as (typeof allowedFoodImageTypes)[number]] ?? "webp";
  return `${userId}/${crypto.randomUUID()}.${extension}`;
}

export async function createSignedImageUrlMap(
  supabase: SupabaseClient<Database>,
  paths: Array<string | null | undefined>,
) {
  const uniquePaths = Array.from(new Set(paths.filter((path): path is string => Boolean(path))));

  if (uniquePaths.length === 0) {
    return new Map<string, string>();
  }

  const { data, error } = await supabase.storage
    .from(foodImagesBucket)
    .createSignedUrls(uniquePaths, 60 * 60);

  if (error || !data) {
    return new Map<string, string>();
  }

  return new Map(
    data
      .filter((item) => item.path && item.signedUrl)
      .map((item) => [item.path as string, item.signedUrl as string]),
  );
}

export async function removeFoodImage(
  supabase: SupabaseClient<Database>,
  path: string | null | undefined,
) {
  if (!path) {
    return;
  }

  await supabase.storage.from(foodImagesBucket).remove([path]);
}
