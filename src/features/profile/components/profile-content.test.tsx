import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnlineStatusProvider } from "@/components/pwa/online-status";
import { ProfileContent } from "@/features/profile/components/profile-content";
import type { ProfilePageData } from "@/features/profile/types";

const { deleteAccountActionMock, refreshMock } = vi.hoisted(() => ({
  deleteAccountActionMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.mock("@/components/user/user-avatar", () => ({
  UserAvatar: ({
    avatarId,
    className,
    imageClassName,
    size,
  }: {
    avatarId?: string | null;
    className?: string;
    imageClassName?: string;
    size?: string;
  }) => (
    <span
      className={className}
      data-image-class-name={imageClassName}
      data-size={size}
      data-testid="user-avatar"
    >
      {avatarId}
    </span>
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
    setNavigatorOnline(true);
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

describe("ProfileContent mobile layout", () => {
  beforeEach(() => {
    setNavigatorOnline(true);
    vi.clearAllMocks();
  });

  it("uses a compact horizontal mobile profile header with a visible avatar", () => {
    render(<ProfileContent data={profilePageData} />);

    const headerLayout = screen.getByTestId("profile-header-layout");
    const avatar = screen.getByTestId("user-avatar");
    const editButton = screen.getByRole("button", { name: "Edit profile" });

    expect(headerLayout).toHaveClass("flex");
    expect(headerLayout).toHaveClass("items-center");
    expect(headerLayout).toHaveClass("sm:justify-between");
    expect(avatar).toHaveAttribute("data-size", "xl");
    expect(avatar).toHaveClass("h-[4.5rem]", "w-[4.5rem]", "sm:h-28", "sm:w-28");
    expect(avatar).toHaveAttribute(
      "data-image-class-name",
      expect.stringContaining("h-16 w-16"),
    );
    expect(screen.getByRole("heading", { name: "Pegah" })).toHaveClass("truncate");
    expect(screen.getByText("Tracking nutrition since July 2026")).toHaveClass(
      "hidden",
      "sm:block",
    );
    expect(editButton).toHaveClass("shrink-0", "w-fit", "min-h-10", "px-4", "sm:min-h-11");
  });

  it("keeps Edit profile functional from the compact header", async () => {
    const user = userEvent.setup();

    render(<ProfileContent data={profilePageData} />);

    await user.click(screen.getByRole("button", { name: "Edit profile" }));

    expect(screen.getByRole("dialog", { name: "Edit profile" })).toBeInTheDocument();
  });

  it("renders unchanged profile statistic values in a three-column mobile layout", () => {
    render(<ProfileContent data={profilePageData} />);

    const stats = screen.getByRole("region", { name: "Profile statistics" });

    expect(stats).toHaveClass("grid-cols-3");
    expect(stats).not.toHaveClass("overflow-x-auto");
    expect(within(stats).getByText("Streak")).toHaveClass("sm:hidden");
    expect(within(stats).getByText("Current streak")).toHaveClass("hidden", "sm:inline");
    expect(within(stats).getByText("3 days")).toBeInTheDocument();
    expect(within(stats).getByText("14")).toBeInTheDocument();
    expect(within(stats).getByText("42")).toBeInTheDocument();
  });

  it("keeps profile data visible while disabling profile mutations offline", () => {
    setNavigatorOnline(false);

    render(
      <OnlineStatusProvider>
        <ProfileContent data={profilePageData} />
      </OnlineStatusProvider>,
    );

    expect(screen.getByRole("heading", { name: "Pegah" })).toBeInTheDocument();
    expect(screen.getByText("peg@example.com")).toBeInTheDocument();
    expect(screen.getByText("3 days")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit profile" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Delete account" })).toBeDisabled();
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

function setNavigatorOnline(isOnline: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value: isOnline,
  });
}
