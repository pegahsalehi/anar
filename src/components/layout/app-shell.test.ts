import { describe, expect, it } from "vitest";
import { getAppShellGreeting } from "@/components/layout/app-shell-greeting";

type GreetingUser = {
  avatarId: string;
  displayName: string;
  email: string;
};

function user(overrides: Partial<GreetingUser>): GreetingUser {
  return {
    avatarId: "anar-default",
    displayName: "",
    email: "",
    ...overrides,
  };
}

describe("getAppShellGreeting", () => {
  it("prefers the first name from a profile display name", () => {
    expect(
      getAppShellGreeting(
        user({
          displayName: "Pegah Salehi",
          email: "pegah@example.com",
        }),
      ),
    ).toBe("Hi, Pegah");
  });

  it("falls back to an email-derived name when the profile name is unavailable", () => {
    expect(
      getAppShellGreeting(
        user({
          displayName: "User",
          email: "pegah.salehi@example.com",
        }),
      ),
    ).toBe("Hi, pegah.salehi");
  });

  it("does not render an empty comma when no usable name exists", () => {
    expect(getAppShellGreeting(user({ displayName: "   ", email: "" }))).toBe("Hi");
  });
});
