import { describe, expect, it } from "vitest";
import { signupSchema } from "@/features/auth/schemas";

const validSignup = {
  displayName: "Pegah",
  email: "pegah@example.com",
  password: "supersecure",
  confirmPassword: "supersecure",
  timezone: "Europe/Oslo",
};

describe("signupSchema", () => {
  it("accepts the simplified first signup step", () => {
    expect(signupSchema.safeParse(validSignup).success).toBe(true);
  });

  it("requires a first name", () => {
    const parsed = signupSchema.safeParse({ ...validSignup, displayName: "" });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe("Enter your first name.");
    }
  });

  it("requires password confirmation to match", () => {
    const parsed = signupSchema.safeParse({
      ...validSignup,
      confirmPassword: "different-password",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: "Passwords do not match.",
            path: ["confirmPassword"],
          }),
        ]),
      );
    }
  });
});
