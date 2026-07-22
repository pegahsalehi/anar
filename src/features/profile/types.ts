import type { AvatarId } from "@/features/profile/avatar-options";

export type ProfileStatsData = {
  currentStreak: number;
  activeDays: number;
  foodsLogged: number;
};

export type ProfilePageData = {
  avatarId: AvatarId;
  displayName: string;
  email: string;
  memberSince: string;
  stats: ProfileStatsData;
  error: string | null;
};

export type ProfileIdentityField = "displayName" | "avatarId";

export type ProfileIdentityValues = {
  avatarId: AvatarId;
  displayName: string;
  email: string;
};

export type ProfileIdentityActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
  fieldErrors: Partial<Record<ProfileIdentityField, string>>;
  profile?: ProfileIdentityValues;
  profileError?: string | null;
  profileUpdated?: boolean;
};

export const initialProfileIdentityActionState: ProfileIdentityActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

export type DeleteAccountField = "confirmation";

export type DeleteAccountActionState = {
  status: "idle" | "error";
  message: string | null;
  fieldErrors: Partial<Record<DeleteAccountField, string>>;
};

export const initialDeleteAccountActionState: DeleteAccountActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};
