import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DeleteAccountActionState } from "@/features/profile/types";

const {
  createServerSupabaseClientMock,
  createSupabaseAdminClientMock,
  redirectMock,
} = vi.hoisted(() => ({
  createServerSupabaseClientMock: vi.fn(),
  createSupabaseAdminClientMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: createServerSupabaseClientMock,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: createSupabaseAdminClientMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("deleteAccountAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    redirectMock.mockImplementation((url: string) => {
      throw new Error(`NEXT_REDIRECT:${url}`);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects invalid confirmation text before touching Supabase", async () => {
    const result = await deleteAccount(deleteAccountFormData({ confirmation: "delete" }));

    expect(result).toEqual({
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: {
        confirmation: "Type DELETE to confirm account deletion.",
      },
    });
    expect(createServerSupabaseClientMock).not.toHaveBeenCalled();
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated deletion without creating an admin client", async () => {
    createServerSupabaseClientMock.mockResolvedValue(
      createDeleteAccountSupabaseMock({
        user: null,
      }).supabase,
    );

    const result = await deleteAccount(deleteAccountFormData());

    expect(result).toEqual({
      status: "error",
      message: "Your session has expired. Please sign in again.",
      fieldErrors: {},
    });
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
  });

  it("uses the authenticated user ID and removes only owned verified Storage paths", async () => {
    const signOutMock = vi.fn().mockResolvedValue({ error: null });
    const serverMock = createDeleteAccountSupabaseMock({
      foods: [
        { image_path: "user-1/food-a.webp" },
        { image_path: "other-user/food-b.webp" },
        { image_path: null },
      ],
      logs: [
        { image_path_snapshot: "user-1/food-a.webp" },
        { image_path_snapshot: "user-1/log-snapshot.webp" },
        { image_path_snapshot: "other-user/log-snapshot.webp" },
      ],
      profile: {
        avatar_path: "user-1/profile.webp",
      },
      signOutMock,
      user: authenticatedUser(),
    });
    const adminMock = createAdminSupabaseMock({
      storageObjects: [
        storageObject("user-1", "profile.webp"),
        storageObject("user-1", "food-a.webp"),
        storageObject("user-1", "log-snapshot.webp"),
        storageObject("other-user", "not-owned.webp"),
      ],
    });
    createServerSupabaseClientMock.mockResolvedValue(serverMock.supabase);
    createSupabaseAdminClientMock.mockReturnValue(adminMock.supabase);

    await expect(
      deleteAccount(deleteAccountFormData({ targetUserId: "other-user" })),
    ).rejects.toThrow("NEXT_REDIRECT:/login?deleted=1");

    expect(serverMock.profileEqMock).toHaveBeenCalledWith("id", "user-1");
    expect(serverMock.foodsEqMock).toHaveBeenCalledWith("user_id", "user-1");
    expect(serverMock.logsEqMock).toHaveBeenCalledWith("user_id", "user-1");
    expect(adminMock.storageFromMock).toHaveBeenCalledWith("food-images");
    expect(adminMock.removeMock).toHaveBeenCalledWith([
      "user-1/profile.webp",
      "user-1/food-a.webp",
      "user-1/log-snapshot.webp",
    ]);
    expect(adminMock.deleteUserMock).toHaveBeenCalledWith("user-1", false);
    expect(signOutMock).toHaveBeenCalledWith({ scope: "global" });
  });

  it("deletes the Auth user only after Storage cleanup succeeds", async () => {
    const serverMock = createDeleteAccountSupabaseMock({
      foods: [{ image_path: "user-1/food.webp" }],
      user: authenticatedUser(),
    });
    const adminMock = createAdminSupabaseMock({
      storageObjects: [storageObject("user-1", "food.webp")],
    });
    createServerSupabaseClientMock.mockResolvedValue(serverMock.supabase);
    createSupabaseAdminClientMock.mockReturnValue(adminMock.supabase);

    await expect(deleteAccount(deleteAccountFormData())).rejects.toThrow(
      "NEXT_REDIRECT:/login?deleted=1",
    );

    expect(adminMock.removeMock).toHaveBeenCalledWith(["user-1/food.webp"]);
    expect(adminMock.removeMock.mock.invocationCallOrder[0]).toBeLessThan(
      adminMock.deleteUserMock.mock.invocationCallOrder[0],
    );
  });

  it("does not delete the Auth user when Storage cleanup fails", async () => {
    const serverMock = createDeleteAccountSupabaseMock({
      foods: [{ image_path: "user-1/food.webp" }],
      user: authenticatedUser(),
    });
    const adminMock = createAdminSupabaseMock({
      storageObjects: [storageObject("user-1", "food.webp")],
      storageError: {
        message: "Storage unavailable",
      },
    });
    createServerSupabaseClientMock.mockResolvedValue(serverMock.supabase);
    createSupabaseAdminClientMock.mockReturnValue(adminMock.supabase);

    const result = await deleteAccount(deleteAccountFormData());

    expect(result).toEqual({
      status: "error",
      message: "Uploaded files could not be deleted. Please try again.",
      fieldErrors: {},
    });
    expect(adminMock.deleteUserMock).not.toHaveBeenCalled();
    expect(serverMock.signOutMock).not.toHaveBeenCalled();
  });

  it("returns a safe error when Storage listing fails", async () => {
    const serverMock = createDeleteAccountSupabaseMock({
      foods: [{ image_path: "user-1/food.webp" }],
      user: authenticatedUser(),
    });
    const adminMock = createAdminSupabaseMock({
      storageListError: {
        message: "Storage list failed",
      },
    });
    createServerSupabaseClientMock.mockResolvedValue(serverMock.supabase);
    createSupabaseAdminClientMock.mockReturnValue(adminMock.supabase);

    const result = await deleteAccount(deleteAccountFormData());

    expect(result).toEqual({
      status: "error",
      message: "Uploaded files could not be deleted. Please try again.",
      fieldErrors: {},
    });
    expect(adminMock.removeMock).not.toHaveBeenCalled();
    expect(adminMock.deleteUserMock).not.toHaveBeenCalled();
  });

  it("does not delete the Auth user when account data cannot be prepared", async () => {
    const serverMock = createDeleteAccountSupabaseMock({
      foodsError: {
        code: "42501",
        message: "permission denied",
      },
      user: authenticatedUser(),
    });
    const adminMock = createAdminSupabaseMock();
    createServerSupabaseClientMock.mockResolvedValue(serverMock.supabase);
    createSupabaseAdminClientMock.mockReturnValue(adminMock.supabase);

    const result = await deleteAccount(deleteAccountFormData());

    expect(result).toEqual({
      status: "error",
      message: "Account data could not be prepared for deletion. Please try again.",
      fieldErrors: {},
    });
    expect(createSupabaseAdminClientMock).not.toHaveBeenCalled();
    expect(adminMock.deleteUserMock).not.toHaveBeenCalled();
  });

  it("returns a safe error when the admin client is missing server configuration", async () => {
    const serverMock = createDeleteAccountSupabaseMock({
      user: authenticatedUser(),
    });
    createServerSupabaseClientMock.mockResolvedValue(serverMock.supabase);
    createSupabaseAdminClientMock.mockImplementation(() => {
      throw new Error(
        "Missing Supabase admin environment variables: SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY",
      );
    });

    const result = await deleteAccount(deleteAccountFormData());

    expect(result).toEqual({
      status: "error",
      message: "Account could not be deleted. Please try again.",
      fieldErrors: {},
    });
    expect(serverMock.signOutMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      "[profile:deleteAccount] operation failed",
      expect.objectContaining({
        message:
          "Missing Supabase admin environment variables: SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY",
        operation: "admin.createClient",
      }),
    );
  });

  it("returns a safe error when admin-client initialization fails", async () => {
    const serverMock = createDeleteAccountSupabaseMock({
      user: authenticatedUser(),
    });
    createServerSupabaseClientMock.mockResolvedValue(serverMock.supabase);
    createSupabaseAdminClientMock.mockImplementation(() => {
      throw new Error("Admin client initialization failed");
    });

    const result = await deleteAccount(deleteAccountFormData());

    expect(result).toEqual({
      status: "error",
      message: "Account could not be deleted. Please try again.",
      fieldErrors: {},
    });
    expect(serverMock.signOutMock).not.toHaveBeenCalled();
  });

  it("returns a safe error when Auth user deletion fails", async () => {
    const serverMock = createDeleteAccountSupabaseMock({
      foods: [{ image_path: "user-1/food.webp" }],
      user: authenticatedUser(),
    });
    const adminMock = createAdminSupabaseMock({
      deleteUserError: {
        code: "500",
        message: "Auth service unavailable",
      },
    });
    createServerSupabaseClientMock.mockResolvedValue(serverMock.supabase);
    createSupabaseAdminClientMock.mockReturnValue(adminMock.supabase);

    const result = await deleteAccount(deleteAccountFormData());

    expect(result).toEqual({
      status: "error",
      message: "Account could not be deleted. Please try again.",
      fieldErrors: {},
    });
    expect(adminMock.deleteUserMock).toHaveBeenCalledWith("user-1", false);
    expect(serverMock.signOutMock).not.toHaveBeenCalled();
  });

  it("redirects to login after successful hard deletion", async () => {
    const serverMock = createDeleteAccountSupabaseMock({
      user: authenticatedUser(),
    });
    const adminMock = createAdminSupabaseMock();
    createServerSupabaseClientMock.mockResolvedValue(serverMock.supabase);
    createSupabaseAdminClientMock.mockReturnValue(adminMock.supabase);

    await expect(deleteAccount(deleteAccountFormData())).rejects.toThrow(
      "NEXT_REDIRECT:/login?deleted=1",
    );

    expect(adminMock.removeMock).not.toHaveBeenCalled();
    expect(adminMock.deleteUserMock).toHaveBeenCalledWith("user-1", false);
    expect(serverMock.signOutMock).toHaveBeenCalledWith({ scope: "global" });
    expect(redirectMock).toHaveBeenCalledWith("/login?deleted=1");
  });
});

async function deleteAccount(formData: FormData) {
  const { deleteAccountAction } = await import("@/features/profile/delete-account-action");
  const previousState: DeleteAccountActionState = {
    status: "idle",
    message: null,
    fieldErrors: {},
  };

  return deleteAccountAction(previousState, formData);
}

function deleteAccountFormData({
  confirmation = "DELETE",
  targetUserId,
}: {
  confirmation?: string;
  targetUserId?: string;
} = {}) {
  const formData = new FormData();
  formData.set("confirmation", confirmation);

  if (targetUserId) {
    formData.set("userId", targetUserId);
  }

  return formData;
}

function authenticatedUser() {
  return {
    id: "user-1",
    email: "peg@example.com",
  };
}

function createDeleteAccountSupabaseMock({
  foods = [],
  foodsError = null,
  logs = [],
  logsError = null,
  profile = {
    avatar_path: null,
  },
  profileError = null,
  signOutMock = vi.fn().mockResolvedValue({ error: null }),
  user,
}: {
  foods?: Array<{ image_path: string | null }>;
  foodsError?: unknown;
  logs?: Array<{ image_path_snapshot: string | null }>;
  logsError?: unknown;
  profile?: { avatar_path: string | null } | null;
  profileError?: unknown;
  signOutMock?: ReturnType<typeof vi.fn>;
  user: ReturnType<typeof authenticatedUser> | null;
}) {
  const profileEqMock = vi.fn(() => profileBuilder);
  const profileBuilder = {
    eq: profileEqMock,
    maybeSingle: vi.fn().mockResolvedValue({
      data: profile,
      error: profileError,
    }),
  };
  const foodsEqMock = vi.fn().mockResolvedValue({
    data: foods,
    error: foodsError,
  });
  const foodsBuilder = {
    eq: foodsEqMock,
  };
  const logsEqMock = vi.fn().mockResolvedValue({
    data: logs,
    error: logsError,
  });
  const logsBuilder = {
    eq: logsEqMock,
  };

  return {
    foodsEqMock,
    logsEqMock,
    profileEqMock,
    signOutMock,
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user },
          error: null,
        }),
        signOut: signOutMock,
      },
      from: vi.fn((table: string) => {
        if (table === "profiles") {
          return {
            select: vi.fn(() => profileBuilder),
          };
        }

        if (table === "foods") {
          return {
            select: vi.fn(() => foodsBuilder),
          };
        }

        if (table === "food_logs") {
          return {
            select: vi.fn(() => logsBuilder),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    },
  };
}

function createAdminSupabaseMock({
  deleteUserError = null,
  storageListError = null,
  storageObjects = [],
  storageError = null,
}: {
  deleteUserError?: unknown;
  storageListError?: unknown;
  storageObjects?: StorageObject[];
  storageError?: unknown;
} = {}) {
  const removeMock = vi.fn().mockResolvedValue({ data: [], error: storageError });
  const listMock = vi.fn().mockResolvedValue({
    data: storageObjects,
    error: storageListError,
  });
  const storageFromMock = vi.fn(() => ({
    list: listMock,
    remove: removeMock,
  }));
  const deleteUserMock = vi.fn().mockResolvedValue({
    data: {
      user: null,
    },
    error: deleteUserError,
  });

  return {
    deleteUserMock,
    listMock,
    removeMock,
    storageFromMock,
    supabase: {
      auth: {
        admin: {
          deleteUser: deleteUserMock,
        },
      },
      storage: {
        from: storageFromMock,
      },
    },
  };
}

type StorageObject = {
  id: string;
  metadata: Record<string, unknown>;
  name: string;
  owner: string;
};

function storageObject(owner: string, name: string): StorageObject {
  return {
    id: `${owner}-${name}`,
    metadata: {},
    name,
    owner,
  };
}
