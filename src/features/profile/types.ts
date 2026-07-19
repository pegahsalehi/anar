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

export type ProfileIdentityActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
  fieldErrors: Partial<Record<ProfileIdentityField, string>>;
};

export const initialProfileIdentityActionState: ProfileIdentityActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};
