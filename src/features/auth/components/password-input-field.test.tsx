import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PasswordInputField } from "@/features/auth/components/password-input-field";

describe("PasswordInputField", () => {
  it("toggles between hidden and visible password input types", async () => {
    const user = userEvent.setup();

    render(
      <PasswordInputField
        autoComplete="current-password"
        errorId="password-error"
        label="Password"
        name="password"
        placeholder="Your password"
      />,
    );

    const input = screen.getByLabelText("Password");

    expect(input).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));

    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Hide password" }));

    expect(input).toHaveAttribute("type", "password");
  });

  it("keeps separate visibility state for multiple fields", async () => {
    const user = userEvent.setup();

    render(
      <>
        <PasswordInputField
          autoComplete="new-password"
          errorId="password-error"
          label="Password"
          name="password"
          placeholder="At least 8 characters"
        />
        <PasswordInputField
          autoComplete="new-password"
          errorId="confirm-password-error"
          label="Confirm password"
          name="confirmPassword"
          placeholder="Repeat your password"
        />
      </>,
    );

    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm password");

    await user.click(screen.getAllByRole("button", { name: "Show password" })[0]);

    expect(passwordInput).toHaveAttribute("type", "text");
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
  });
});
