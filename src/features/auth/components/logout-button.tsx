import { LogOut } from "lucide-react";
import { logoutAction } from "@/features/auth/actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary/40"
        type="submit"
      >
        <LogOut aria-hidden="true" className="h-5 w-5" />
        Log out
      </button>
    </form>
  );
}
