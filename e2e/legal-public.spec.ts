import { expect, test } from "@playwright/test";

const legalRoutes = [
  {
    description: "Learn how Anar collects, uses, stores, and protects your information.",
    path: "/privacy",
    title: "Privacy Policy",
  },
  {
    description: "The rules and responsibilities that apply when using Anar.",
    path: "/terms",
    title: "Terms of Use",
  },
  {
    description: "Important information about nutrition data and health decisions.",
    path: "/disclaimer",
    title: "Nutrition Disclaimer",
  },
];

const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];

test.describe("legal and privacy pages", () => {
  test("legal routes are public and render without the authenticated app shell", async ({ page }) => {
    for (const route of legalRoutes) {
      await page.goto(route.path);

      await expect(page).toHaveURL(new RegExp(`${route.path}$`));
      await expect(page.getByRole("heading", { level: 1, name: route.title })).toBeVisible();
      await expect(page.getByText(route.description)).toBeVisible();
      await expect(page.getByText("Effective date: [EFFECTIVE DATE]")).toBeVisible();
      await expect(page.getByRole("link", { name: "Back to Anar" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Today" })).toHaveCount(0);
      await expect(page.getByRole("link", { name: "Foods" })).toHaveCount(0);
      await expect(page.getByRole("link", { name: "History" })).toHaveCount(0);
    }
  });

  test("auth pages expose reusable legal footer links", async ({ page }) => {
    for (const route of authRoutes) {
      await page.goto(route);

      const legalFooter = page.getByRole("navigation", { name: "Legal links" });

      await expect(legalFooter.getByRole("link", { name: "Privacy Policy" })).toBeVisible();
      await expect(legalFooter.getByRole("link", { name: "Terms of Use" })).toBeVisible();
      await expect(legalFooter.getByRole("link", { name: "Nutrition Disclaimer" })).toBeVisible();
    }
  });

  test("signup requires legal acceptance and preserves entered values when legal links open", async ({
    page,
  }) => {
    await page.goto("/signup");

    const nameInput = page.getByLabel("First name");
    const emailInput = page.getByLabel("Email");
    const passwordInput = page.getByLabel("Password", { exact: true });
    const confirmPasswordInput = page.getByLabel("Confirm password");
    const checkbox = page.getByLabel(
      "I agree to the Terms of Use and acknowledge the Privacy Policy and Nutrition Disclaimer.",
    );
    const submitButton = page.getByRole("button", { name: "Create account" });

    await nameInput.fill("Pegah");
    await emailInput.fill("pegah@example.com");
    await passwordInput.fill("supersecure");
    await confirmPasswordInput.fill("supersecure");

    await expect(checkbox).not.toBeChecked();
    await expect(submitButton).toBeDisabled();
    await expect(
      page.getByText("Please review and accept the Terms of Use before creating an account."),
    ).toBeVisible();

    const [termsPage] = await Promise.all([
      page.waitForEvent("popup"),
      page
        .locator("#signup-terms-label")
        .getByRole("link", { name: "Terms of Use" })
        .click(),
    ]);

    await expect(termsPage.getByRole("heading", { level: 1, name: "Terms of Use" })).toBeVisible();
    await termsPage.close();

    await expect(nameInput).toHaveValue("Pegah");
    await expect(emailInput).toHaveValue("pegah@example.com");
    await expect(passwordInput).toHaveValue("supersecure");
    await expect(confirmPasswordInput).toHaveValue("supersecure");
    await expect(checkbox).not.toBeChecked();

    await checkbox.focus();
    await expect(checkbox).toBeFocused();
    await page.keyboard.press("Space");

    await expect(checkbox).toBeChecked();
    await expect(submitButton).toBeEnabled();
    await expect(
      page.getByText("Please review and accept the Terms of Use before creating an account."),
    ).toHaveCount(0);
  });
});
