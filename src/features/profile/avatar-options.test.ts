import { describe, expect, it } from "vitest";
import { getAvatarOption, normalizeAvatarId } from "@/features/profile/avatar-options";
import { profileIdentitySchema } from "@/features/profile/schemas";

describe("avatar options", () => {
  it("normalizes legacy avatar ids to image avatar ids", () => {
    expect(normalizeAvatarId("pomegranate")).toBe("4");
    expect(normalizeAvatarId("avocado")).toBe("1");
    expect(normalizeAvatarId("strawberry")).toBe("2");
    expect(normalizeAvatarId("carrot")).toBe("6");
    expect(normalizeAvatarId("lemon")).toBe("3");
    expect(normalizeAvatarId("walnut")).toBe("9");
    expect(normalizeAvatarId("missing")).toBe("1");
  });

  it("resolves avatar image metadata", () => {
    expect(getAvatarOption("7")).toMatchObject({
      id: "7",
      label: "Kiwi",
      imagePath: "/images/avatar/7.png",
    });
  });

  it("accepts only new image avatar ids for profile saves", () => {
    expect(
      profileIdentitySchema.safeParse({
        avatarId: "1",
        displayName: "Anar User",
        email: "user@example.com",
      }).success,
    ).toBe(true);

    expect(
      profileIdentitySchema.safeParse({
        avatarId: "pomegranate",
        displayName: "Anar User",
        email: "user@example.com",
      }).success,
    ).toBe(false);
  });
});
