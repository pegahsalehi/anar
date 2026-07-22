import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  landingBackgrounds,
  PublicLandingPage,
} from "@/components/landing/public-landing-page";

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

describe("PublicLandingPage", () => {
  it("renders the public landing page for unauthenticated visitors", () => {
    render(<PublicLandingPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Made for the meals you actually eat.",
      }),
    ).toBeInTheDocument();
  });

  it("renders the intended desktop and mobile content", () => {
    render(<PublicLandingPage />);

    expect(screen.getByText("Personal nutrition-tracking app")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Save your everyday meals, homemade recipes, and local foods in one personal library. Add them once, then log them again in seconds.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Your own food library")).toBeInTheDocument();
    expect(screen.getByText("Faster everyday logging")).toBeInTheDocument();
    expect(screen.getByText("Nutrition without the clutter")).toBeInTheDocument();
  });

  it("links account actions to the existing auth routes", () => {
    render(<PublicLandingPage />);

    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Create account" })).toHaveAttribute(
      "href",
      "/signup",
    );
  });

  it("preserves a safe next redirect for the login route", () => {
    render(<PublicLandingPage nextPath="/foods" />);

    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login?next=%2Ffoods",
    );
  });

  it("configures the supplied public image paths as responsive page backgrounds", () => {
    render(<PublicLandingPage />);
    const page = screen.getByTestId("public-landing-page");

    expect(page).toHaveAttribute("data-mobile-background", landingBackgrounds.mobile);
    expect(page).toHaveAttribute("data-desktop-background", landingBackgrounds.desktop);
    expect(page.getAttribute("style")).toContain(
      `--landing-mobile-background: url("${landingBackgrounds.mobile}")`,
    );
    expect(page.getAttribute("style")).toContain(
      `--landing-desktop-background: url("${landingBackgrounds.desktop}")`,
    );
  });

  it("renders the landing content as an overlay instead of a side-by-side image layout", () => {
    const { container } = render(<PublicLandingPage />);

    expect(screen.getByTestId("landing-overlay")).toBeInTheDocument();
    expect(container.querySelector(`img[src="${landingBackgrounds.mobile}"]`)).not.toBeInTheDocument();
    expect(
      container.querySelector(`img[src="${landingBackgrounds.desktop}"]`),
    ).not.toBeInTheDocument();
  });
});
