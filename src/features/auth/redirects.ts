export function getSafeRedirectPath(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string" || value.length === 0) {
    return "/today";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/today";
  }

  return value;
}
