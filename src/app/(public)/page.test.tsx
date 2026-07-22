import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { createServerSupabaseClientMock, redirectMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  redirectMock: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("next/image", () => ({
  default: ({
    alt,
    priority: _priority,
    src,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} {...props} />
  ),
}));

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

describe("home page", () => {
  it("lets unauthenticated users view the landing page", async () => {
    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: null,
          },
        }),
      },
    });

    const Page = (await import("@/app/(public)/page")).default;
    const result = await Page({ searchParams: Promise.resolve({}) });
    render(result);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Made for the meals you actually eat.",
      }),
    ).toBeInTheDocument();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("keeps redirecting authenticated users to the app", async () => {
    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-id",
            },
          },
        }),
      },
    });

    const Page = (await import("@/app/(public)/page")).default;

    await expect(Page({ searchParams: Promise.resolve({}) })).rejects.toThrow("redirect:/today");
    expect(redirectMock).toHaveBeenCalledWith("/today");
  });

  it("passes safe next redirects to the landing login action", async () => {
    createServerSupabaseClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: null,
          },
        }),
      },
    });

    const Page = (await import("@/app/(public)/page")).default;
    const result = await Page({ searchParams: Promise.resolve({ next: "/history" }) });
    render(result);

    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login?next=%2Fhistory",
    );
  });
});
