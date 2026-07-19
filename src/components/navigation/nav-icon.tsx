import { CalendarDays, Home, Settings, Utensils } from "lucide-react";
import type { AppNavItem } from "@/lib/navigation";

type NavIconProps = {
  icon: AppNavItem["icon"];
  className?: string;
};

const iconMap = {
  today: Home,
  foods: Utensils,
  history: CalendarDays,
  settings: Settings,
};

export function NavIcon({ icon, className }: NavIconProps) {
  const Icon = iconMap[icon];

  return <Icon aria-hidden="true" className={className} />;
}
