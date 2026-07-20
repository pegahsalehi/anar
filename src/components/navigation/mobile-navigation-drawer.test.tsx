import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MobileNavigationDrawer } from "@/components/navigation/mobile-navigation-drawer";

const { pathnameMock } = vi.hoisted(() => ({
  pathnameMock: {
    value: "/today",
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock.value,
}));

vi.mock("next/link", async () => {
  const React = await import("react");

  return {
    default: ({
      children,
      href,
      onClick,
      ...props
    }: {
      children: React.ReactNode;
      href: string;
      onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    }) =>
      React.createElement(
        "a",
        {
          href,
          onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();
            onClick?.(event);
          },
          ...props,
        },
        children,
      ),
  };
});

vi.mock("next/image", async () => {
  const React = await import("react");

  return {
    default: ({ alt, priority: _priority, ...props }: { alt?: string; priority?: boolean }) =>
      React.createElement("img", { alt: alt ?? "", ...props }),
  };
});

describe("MobileNavigationDrawer", () => {
  beforeEach(() => {
    pathnameMock.value = "/today";
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("opens from the mobile logo area, marks the active page, and closes on Escape", async () => {
    const user = userEvent.setup();

    render(<MobileNavigationDrawer />);

    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Navigation menu" });

    expect(document.body.style.overflow).toBe("hidden");
    expect(within(dialog).getByRole("link", { name: "Today" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await waitFor(() => {
      expect(within(dialog).getByRole("button", { name: "Close navigation menu" })).toHaveFocus();
    });

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog", { name: "Navigation menu" })).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it("closes when a navigation link is selected", async () => {
    const user = userEvent.setup();

    render(<MobileNavigationDrawer />);

    await user.click(screen.getByRole("button", { name: "Open navigation menu" }));
    await user.click(screen.getByRole("link", { name: "Food Library" }));

    expect(screen.queryByRole("dialog", { name: "Navigation menu" })).not.toBeInTheDocument();
  });
});
