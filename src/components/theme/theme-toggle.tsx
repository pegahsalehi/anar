"use client";

import { useEffect, useState } from "react";
import { Moon, SunMedium } from "lucide-react";

type Theme = "light" | "dark";

const storageKey = "anar-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(storageKey);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme = storedTheme === "dark" || (!storedTheme && prefersDark) ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem(storageKey, nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }

  const Icon = theme === "dark" ? SunMedium : Moon;
  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-sm transition hover:border-primary/40 hover:text-primary"
      onClick={toggleTheme}
      title={label}
      type="button"
    >
      <Icon aria-hidden="true" className="h-5 w-5" />
    </button>
  );
}
