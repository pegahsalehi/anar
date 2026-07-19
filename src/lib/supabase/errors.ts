export function isRealSupabaseRequestError(error: unknown) {
  if (!error) {
    return false;
  }

  return !isExpectedNoRowsError(error);
}

function isExpectedNoRowsError(error: unknown) {
  if (!isObject(error)) {
    return false;
  }

  if (error.code !== "PGRST116") {
    return false;
  }

  const details = typeof error.details === "string" ? error.details.toLowerCase() : "";
  const message = typeof error.message === "string" ? error.message.toLowerCase() : "";

  return details.includes("0 rows") || message.includes("0 rows") || message.includes("no rows");
}

function isObject(value: unknown): value is {
  code?: unknown;
  details?: unknown;
  message?: unknown;
} {
  return Boolean(value) && typeof value === "object";
}
