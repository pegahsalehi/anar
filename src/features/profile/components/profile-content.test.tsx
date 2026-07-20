import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileContent } from "@/features/profile/components/profile-content";
import type { ProfilePageData } from "@/features/profile/types";

const { deleteAccountActionMock, refreshMock } = vi.hoisted(() => ({
  deleteAccountActionMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.mock("@/components/user/user-avatar", () => ({
  UserAvatar: ({ avatarId }: { avatarId?: string | null }) => (
    <span data-testid="user-avatar">{avatarId}</span>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

vi.mock("@/features/profile/delete-account-action", () => ({
  deleteAccountAction: deleteAccountActionMock,
}));

vi.mock("@/features/profile/actions", () => ({
  saveProfileIdentityAction: vi.fn(),
}));

vi.mock("@/features/profile/components/profile-password-form", () => ({
  ProfilePasswordForm: () => <div data-testid="profile-password-form" />,
}));

vi.mock("@/features/auth/components/logout-button", () => ({
  LogoutButton: () => <button type="button">Log out</button>,
}));

describe("ProfileContent delete account modal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    deleteAccountActionMock.mockResolvedValue({
      status: "idle",
      message: null,
      fieldErrors: {},
    });
  });

  it("opens an accessible confirmation modal from the danger zone", async () => {
    const user = userEvent.setup();

    render(<ProfileContent data={profilePageData} />);

    await user.click(screen.getByRole("button", { name: "Delete account" }));

    const dialog = screen.getByRole("dialog", {
      name: "Delete your account?",
    });

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(
      within(dialog).getByText(
        "This will permanently delete your account and all associated data. This action cannot be undone.",
      ),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(within(dialog).getByLabelText("Type DELETE to confirm")).toHaveFocus();
    });
  });

  it("keeps the final delete button disabled until DELETE is typed exactly", async () => {
    const user = userEvent.setup();

    render(<ProfileContent data={profilePageData} />);

    await user.click(screen.getByRole("button", { name: "Delete account" }));

    const dialog = screen.getByRole("dialog", {
      name: "Delete your account?",
    });
    const input = within(dialog).getByLabelText("Type DELETE to confirm");
    const submitButton = within(dialog).getByRole("button", {
      name: "Permanently delete account",
    });

    expect(submitButton).toBeDisabled();

    await user.type(input, "delete");

    expect(submitButton).toBeDisabled();

    await user.clear(input);
    await user.type(input, "DELETE");

    expect(submitButton).toBeEnabled();
  });

  it("closes on cancel without requesting account deletion", async () => {
    const user = userEvent.setup();

    render(<ProfileContent data={profilePageData} />);

    const openButton = screen.getByRole("button", { name: "Delete account" });

    await user.click(openButton);
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(deleteAccountActionMock).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(openButton).toHaveFocus();
    });
  });
});

const profilePageData: ProfilePageData = {
  avatarId: "1",
  displayName: "Pegah",
  email: "peg@example.com",
  error: null,
  memberSince: "2026-07-20",
  stats: {
    activeDays: 14,
    currentStreak: 3,
    foodsLogged: 42,
  },
};
