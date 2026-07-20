import type { ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SettingsPage from "./page";

const { getSettingsPageDataMock } = vi.hoisted(() => ({
  getSettingsPageDataMock: vi.fn(),
}));

vi.mock("@/features/settings/queries", () => ({
  getSettingsPageData: getSettingsPageDataMock,
}));

vi.mock("@/features/settings/components/daily-nutrition-targets-form", () => ({
  DailyNutritionTargetsForm: () => <div data-testid="daily-nutrition-targets-form" />,
}));

vi.mock("@/features/settings/components/settings-accordion-card", () => ({
  SettingsAccordionCard: ({
    children,
    title,
  }: {
    children: ReactNode;
    title: string;
  }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

describe("SettingsPage", () => {
  beforeEach(() => {
    getSettingsPageDataMock.mockResolvedValue({
      dailyGoals: {
        caloriesTarget: 2000,
        carbohydratesTarget: 275,
        fatTarget: 78,
        proteinTarget: 50,
      },
      effectiveDate: "2026-07-20",
      error: null,
    });
  });

  it("renders legal and privacy links in the authenticated app view", async () => {
    render(await SettingsPage());

    const legalNav = screen.getByRole("navigation", {
      name: "Legal and privacy documents",
    });

    expect(within(legalNav).getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
      "href",
      "/privacy",
    );
    expect(within(legalNav).getByRole("link", { name: "Terms of Use" })).toHaveAttribute(
      "href",
      "/terms",
    );
    expect(
      within(legalNav).getByRole("link", { name: "Nutrition Disclaimer" }),
    ).toHaveAttribute("href", "/disclaimer");
  });
});
