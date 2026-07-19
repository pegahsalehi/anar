export type AuthFieldErrors = Partial<Record<"email" | "password" | "displayName", string>>;

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
  fieldErrors: AuthFieldErrors;
};

export const initialAuthState: AuthActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};
