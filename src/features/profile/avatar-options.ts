export const avatarOptions = [
  {
    id: "1",
    label: "Avocado",
    imagePath: "/images/avatar/1.png",
  },
  {
    id: "2",
    label: "Strawberry",
    imagePath: "/images/avatar/2.png",
  },
  {
    id: "3",
    label: "Lemon",
    imagePath: "/images/avatar/3.png",
  },
  {
    id: "4",
    label: "Apple",
    imagePath: "/images/avatar/4.png",
  },
  {
    id: "5",
    label: "Banana",
    imagePath: "/images/avatar/5.png",
  },
  {
    id: "6",
    label: "Orange",
    imagePath: "/images/avatar/6.png",
  },
  {
    id: "7",
    label: "Kiwi",
    imagePath: "/images/avatar/7.png",
  },
  {
    id: "8",
    label: "Peach",
    imagePath: "/images/avatar/8.png",
  },
  {
    id: "9",
    label: "Pear",
    imagePath: "/images/avatar/9.png",
  },
] as const;

export type AvatarId = (typeof avatarOptions)[number]["id"];

export const avatarIds = avatarOptions.map((option) => option.id) as [
  AvatarId,
  ...AvatarId[],
];

export const defaultAvatarId: AvatarId = "1";

const legacyAvatarIdMap: Record<string, AvatarId> = {
  pomegranate: "4",
  avocado: "1",
  strawberry: "2",
  carrot: "6",
  lemon: "3",
  walnut: "9",
};

export function isAvatarId(value: unknown): value is AvatarId {
  return typeof value === "string" && avatarIds.includes(value as AvatarId);
}

export function normalizeAvatarId(value: string | null | undefined): AvatarId {
  if (isAvatarId(value)) {
    return value;
  }

  return value ? legacyAvatarIdMap[value] ?? defaultAvatarId : defaultAvatarId;
}

export function getAvatarOption(value: string | null | undefined) {
  const avatarId = normalizeAvatarId(value);
  return avatarOptions.find((option) => option.id === avatarId) ?? avatarOptions[0];
}
