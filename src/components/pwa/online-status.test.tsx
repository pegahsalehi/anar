import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  OfflineStatusBanner,
  OnlineOnlyLink,
  OnlineStatusProvider,
  offlineMutationMessage,
} from "@/components/pwa/online-status";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("OnlineStatusProvider", () => {
  beforeEach(() => {
    setNavigatorOnline(true);
  });

  it("shows and hides the offline banner as connectivity changes", () => {
    render(
      <OnlineStatusProvider>
        <OfflineStatusBanner />
      </OnlineStatusProvider>,
    );

    expect(screen.queryByText(/You're offline/)).not.toBeInTheDocument();

    act(() => {
      setNavigatorOnline(false);
      window.dispatchEvent(new Event("offline"));
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      "You're offline. Changes are unavailable until you reconnect.",
    );

    act(() => {
      setNavigatorOnline(true);
      window.dispatchEvent(new Event("online"));
    });

    expect(screen.queryByText(/You're offline/)).not.toBeInTheDocument();
  });

  it("prevents online-only links from navigating while offline", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    setNavigatorOnline(false);

    render(
      <OnlineStatusProvider>
        <OnlineOnlyLink href="/foods/new" onClick={handleClick}>
          Create food
        </OnlineOnlyLink>
      </OnlineStatusProvider>,
    );

    const link = screen.getByRole("link", { name: "Create food" });

    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("title", offlineMutationMessage);

    await user.click(link);

    expect(handleClick).not.toHaveBeenCalled();
  });
});

function setNavigatorOnline(isOnline: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value: isOnline,
  });
}
