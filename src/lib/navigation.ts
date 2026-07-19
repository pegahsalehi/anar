export type AppNavItem = {
  href: string;
  label: string;
  icon: "today" | "foods" | "history" | "settings";
};

export const appNavItems: AppNavItem[] = [
  {
    href: "/today",
    label: "Today",
    icon: "today",
  },
  {
    href: "/foods",
    label: "Food Library",
    icon: "foods",
  },
  {
    href: "/history",
    label: "History",
    icon: "history",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: "settings",
  },
];
