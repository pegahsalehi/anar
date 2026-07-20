import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ProfileIdentityActionState } from "@/features/profile/types";

const { createServerSupabaseClientMock, headersMock, revalidatePathMock } = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  headersMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

describe("saveProfileIdentityAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    headersMock.mockResolvedValue({
      get: vi.fn(() => "http://localhost:3000"),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("saves trimmed display name and avatar to the authenticated profile record", async () => {
    const updateEqMock = vi.fn();
    const updateUserMock = vi.fn();
    const updateProfileMock = vi.fn();
    const supabase = createProfileSupabaseMock({
      profile: {
        avatar_id: "1",
        display_name: "Pegah",
      },
      updateProfileMock,
      updateProfileResult: {
        data: {
          avatar_id: "2",
          display_name: "Pegah New",
        },
        error: null,
      },
      updateEqMock,
      updateUserMock,
      user: authenticatedUser(),
    });
    createServerSupabaseClientMock.mockResolvedValue(supabase);

    const result = await save(
      profileFormData({
        avatarId: "2",
        displayName: "  Pegah New  ",
        email: "PEG@example.com",
      }),
    );

    expect(result).toEqual({
      status: "success",
      message: "Profile saved.",
      fieldErrors: {},
      emailConfirmationRequired: false,
      profileUpdated: true,
      profile: {
        avatarId: "2",
        displayName: "Pegah New",
        email: "peg@example.com",
      },
    });
    expect(updateProfileMock).toHaveBeenCalledWith({
      avatar_id: "2",
      display_name: "Pegah New",
    });
    expect(updateEqMock).toHaveBeenCalledWith("id", "user-1");
    expect(updateUserMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).toHaveBeenCalledWith("/profile");
    expect(revalidatePathMock).toHaveBeenCalledWith("/foods");
  });

  it("saves an avatar-only change without updating email", async () => {
    const updateProfileMock = vi.fn();
    const updateUserMock = vi.fn();
    const supabase = createProfileSupabaseMock({
      profile: {
        avatar_id: "1",
        display_name: "Pegah",
      },
      updateProfileMock,
      updateProfileResult: {
        data: {
          avatar_id: "3",
          display_name: "Pegah",
        },
        error: null,
      },
      updateUserMock,
      user: authenticatedUser(),
    });
    createServerSupabaseClientMock.mockResolvedValue(supabase);

    const result = await save(
      profileFormData({
        avatarId: "3",
        displayName: "Pegah",
        email: "peg@example.com",
      }),
    );

    expect(result).toMatchObject({
      status: "success",
      profile: {
        avatarId: "3",
        displayName: "Pegah",
        email: "peg@example.com",
      },
      profileUpdated: true,
    });
    expect(updateProfileMock).toHaveBeenCalledWith({
      avatar_id: "3",
      display_name: "Pegah",
    });
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it("saves a display-name-only change without updating email", async () => {
    const updateProfileMock = vi.fn();
    const updateUserMock = vi.fn();
    const supabase = createProfileSupabaseMock({
      profile: {
        avatar_id: "1",
        display_name: "Pegah",
      },
      updateProfileMock,
      updateProfileResult: {
        data: {
          avatar_id: "1",
          display_name: "Pegah New",
        },
        error: null,
      },
      updateUserMock,
      user: authenticatedUser(),
    });
    createServerSupabaseClientMock.mockResolvedValue(supabase);

    const result = await save(
      profileFormData({
        avatarId: "1",
        displayName: "Pegah New",
        email: "peg@example.com",
      }),
    );

    expect(result).toMatchObject({
      status: "success",
      profile: {
        avatarId: "1",
        displayName: "Pegah New",
        email: "peg@example.com",
      },
      profileUpdated: true,
    });
    expect(updateProfileMock).toHaveBeenCalledWith({
      avatar_id: "1",
      display_name: "Pegah New",
    });
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it("requests an auth email change without replacing the active email when confirmation is required", async () => {
    const updateProfileMock = vi.fn();
    const updateUserMock = vi.fn().mockResolvedValue({
      data: {
        user: {
          email: "peg@example.com",
          email_change_sent_at: "2026-07-20T00:00:00.000Z",
          new_email: "new@example.com",
        },
      },
      error: null,
    });
    const supabase = createProfileSupabaseMock({
      profile: {
        avatar_id: "1",
        display_name: "Pegah",
      },
      updateProfileMock,
      updateProfileResult: {
        data: {
          avatar_id: "2",
          display_name: "Pegah New",
        },
        error: null,
      },
      updateUserMock,
      user: authenticatedUser(),
    });
    createServerSupabaseClientMock.mockResolvedValue(supabase);

    const result = await save(
      profileFormData({
        avatarId: "1",
        displayName: "Pegah",
        email: "new@example.com",
      }),
    );

    expect(result).toMatchObject({
      status: "success",
      message: "Check your new email address to confirm the change.",
      emailConfirmationRequired: true,
      profileUpdated: false,
      profile: {
        avatarId: "1",
        displayName: "Pegah",
        email: "peg@example.com",
      },
    });
    expect(updateUserMock).toHaveBeenCalledWith(
      { email: "new@example.com" },
      { emailRedirectTo: "http://localhost:3000/auth/callback?next=/profile" },
    );
    expect(updateProfileMock).not.toHaveBeenCalled();
  });

  it("saves name, avatar, and email changes together", async () => {
    const updateProfileMock = vi.fn();
    const updateUserMock = vi.fn().mockResolvedValue({
      data: {
        user: {
          email: "peg@example.com",
          email_change_sent_at: "2026-07-20T00:00:00.000Z",
          new_email: "new@example.com",
        },
      },
      error: null,
    });
    const supabase = createProfileSupabaseMock({
      profile: {
        avatar_id: "1",
        display_name: "Pegah",
      },
      updateProfileMock,
      updateProfileResult: {
        data: {
          avatar_id: "2",
          display_name: "Pegah New",
        },
        error: null,
      },
      updateUserMock,
      user: authenticatedUser(),
    });
    createServerSupabaseClientMock.mockResolvedValue(supabase);

    const result = await save(
      profileFormData({
        avatarId: "2",
        displayName: "Pegah New",
        email: "new@example.com",
      }),
    );

    expect(result).toMatchObject({
      status: "success",
      message: "Check your new email address to confirm the change.",
      emailConfirmationRequired: true,
      profile: {
        avatarId: "2",
        displayName: "Pegah New",
        email: "peg@example.com",
      },
      profileUpdated: true,
    });
    expect(updateProfileMock).toHaveBeenCalledWith({
      avatar_id: "2",
      display_name: "Pegah New",
    });
    expect(updateUserMock).toHaveBeenCalledWith(
      { email: "new@example.com" },
      { emailRedirectTo: "http://localhost:3000/auth/callback?next=/profile" },
    );
  });

  it("keeps a saved profile update when auth rejects the email change", async () => {
    const updateProfileMock = vi.fn();
    const updateUserMock = vi.fn().mockResolvedValue({
      data: { user: null },
      error: { message: "User already registered" },
    });
    const supabase = createProfileSupabaseMock({
      profile: {
        avatar_id: "1",
        display_name: "Pegah",
      },
      updateProfileMock,
      updateProfileResult: {
        data: {
          avatar_id: "2",
          display_name: "Pegah New",
        },
        error: null,
      },
      updateUserMock,
      user: authenticatedUser(),
    });
    createServerSupabaseClientMock.mockResolvedValue(supabase);

    const result = await save(
      profileFormData({
        avatarId: "2",
        displayName: "Pegah New",
        email: "used@example.com",
      }),
    );

    expect(result).toEqual({
      status: "error",
      message: "Profile details saved, but email could not be updated.",
      fieldErrors: {
        email: "An account already exists for this email.",
      },
      emailError: "An account already exists for this email.",
      profile: {
        avatarId: "2",
        displayName: "Pegah New",
        email: "peg@example.com",
      },
      profileError: null,
      profileUpdated: true,
    });
    expect(updateUserMock).toHaveBeenCalled();
    expect(updateProfileMock).toHaveBeenCalledWith({
      avatar_id: "2",
      display_name: "Pegah New",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/profile");
  });

  it("uses a safe profile upsert when the authenticated profile row is missing", async () => {
    const updateProfileMock = vi.fn();
    const upsertProfileMock = vi.fn();
    const updateUserMock = vi.fn();
    const supabase = createProfileSupabaseMock({
      profile: null,
      updateProfileMock,
      updateProfileResult: {
        data: {
          avatar_id: "2",
          display_name: "Pegah New",
        },
        error: null,
      },
      updateUserMock,
      upsertProfileMock,
      user: authenticatedUser(),
    });
    createServerSupabaseClientMock.mockResolvedValue(supabase);

    const result = await save(
      profileFormData({
        avatarId: "2",
        displayName: "Pegah New",
        email: "peg@example.com",
      }),
    );

    expect(result).toMatchObject({
      status: "success",
      profile: {
        avatarId: "2",
        displayName: "Pegah New",
      },
      profileUpdated: true,
    });
    expect(updateProfileMock).not.toHaveBeenCalled();
    expect(upsertProfileMock).toHaveBeenCalledWith(
      {
        id: "user-1",
        avatar_id: "2",
        display_name: "Pegah New",
      },
      { onConflict: "id" },
    );
  });

  it("rejects invalid input before touching Supabase", async () => {
    const result = await save(
      profileFormData({
        avatarId: "1",
        displayName: "A",
        email: "not-an-email",
      }),
    );

    expect(result.status).toBe("error");
    expect(result.message).toBe("Please fix the highlighted fields.");
    expect(result.fieldErrors.displayName).toBe("Display name must be at least 2 characters.");
    expect(result.fieldErrors.email).toBe("Enter a valid email address.");
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
  });
});

async function save(formData: FormData) {
  const { saveProfileIdentityAction } = await import("@/features/profile/actions");
  const previousState: ProfileIdentityActionState = {
    status: "idle",
    message: null,
    fieldErrors: {},
  };

  return saveProfileIdentityAction(previousState, formData);
}

function profileFormData(values: {
  avatarId: string;
  displayName: string;
  email: string;
}) {
  const formData = new FormData();
  formData.set("avatarId", values.avatarId);
  formData.set("displayName", values.displayName);
  formData.set("email", values.email);
  return formData;
}

function authenticatedUser() {
  return {
    id: "user-1",
    email: "peg@example.com",
    user_metadata: {
      display_name: "Pegah",
    },
  };
}

function createProfileSupabaseMock({
  profile,
  profileError = null,
  updateEqMock,
  updateProfileMock = vi.fn(),
  updateProfileResult = {
    data: profile,
    error: null,
  },
  updateUserMock = vi.fn(),
  upsertProfileMock = vi.fn(),
  user,
}: {
  profile: { avatar_id: string; display_name: string | null } | null;
  profileError?: unknown;
  updateEqMock?: ReturnType<typeof vi.fn>;
  updateProfileMock?: ReturnType<typeof vi.fn>;
  updateProfileResult?: {
    data: { avatar_id: string; display_name: string | null } | null;
    error: unknown;
  };
  updateUserMock?: ReturnType<typeof vi.fn>;
  upsertProfileMock?: ReturnType<typeof vi.fn>;
  user: ReturnType<typeof authenticatedUser>;
}) {
  const selectBuilder = {
    eq: vi.fn(() => selectBuilder),
    maybeSingle: vi.fn().mockResolvedValue({
      data: profile,
      error: profileError,
    }),
  };
  const effectiveUpdateEqMock = updateEqMock ?? vi.fn();
  const updateBuilder = {
    eq: effectiveUpdateEqMock,
    maybeSingle: vi.fn().mockResolvedValue(updateProfileResult),
    select: vi.fn(() => updateBuilder),
  };
  effectiveUpdateEqMock.mockImplementation(() => updateBuilder);

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: null,
      }),
      updateUser: updateUserMock,
    },
    from: vi.fn((table: string) => {
      if (table !== "profiles") {
        throw new Error(`Unexpected table ${table}`);
      }

      return {
        select: vi.fn(() => selectBuilder),
        update: vi.fn((values) => {
          updateProfileMock(values);
          return updateBuilder;
        }),
        upsert: vi.fn((values, options) => {
          upsertProfileMock(values, options);
          return updateBuilder;
        }),
      };
    }),
  };
}
