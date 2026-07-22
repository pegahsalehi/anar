"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const startupScreenSessionKey = "anar-installed-app-startup-screen-shown";
const mobileMediaQuery = "(max-width: 639px)";
const standaloneMediaQueries = [
  "(display-mode: standalone)",
  "(display-mode: fullscreen)",
];

export function InstalledAppStartupScreen() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // The OS splash is manifest-controlled; this one-time overlay is only for installed mobile startup.
    if (!isInstalledMobileApp() || hasStartupScreenBeenShown()) {
      return;
    }

    if (document.readyState === "complete") {
      markStartupScreenShown();
      return;
    }

    setIsVisible(true);

    const hideStartupScreen = () => {
      markStartupScreenShown();
      setIsVisible(false);
    };

    window.addEventListener("load", hideStartupScreen, { once: true });

    return () => {
      window.removeEventListener("load", hideStartupScreen);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      aria-busy="true"
      aria-label="Loading Anar"
      className="fixed inset-0 z-[100] min-h-[100svh] overflow-hidden bg-[#FFFCF7] sm:hidden"
      role="status"
    >
      <Image
        alt=""
        aria-hidden="true"
        className="object-cover object-center"
        fill
        priority
        sizes="100vw"
        src="/icons/pwa/loading-page.png"
        unoptimized
      />
    </div>
  );
}

function isInstalledMobileApp() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  if (!window.matchMedia(mobileMediaQuery).matches) {
    return false;
  }

  return (
    standaloneMediaQueries.some((query) => window.matchMedia(query).matches) ||
    isIosStandaloneMode(navigator)
  );
}

function isIosStandaloneMode(value: Navigator) {
  return Boolean((value as Navigator & { standalone?: boolean }).standalone);
}

function hasStartupScreenBeenShown() {
  try {
    return window.sessionStorage.getItem(startupScreenSessionKey) === "true";
  } catch {
    return false;
  }
}

function markStartupScreenShown() {
  try {
    window.sessionStorage.setItem(startupScreenSessionKey, "true");
  } catch {
    // Storage can be unavailable in private modes; the startup screen still hides normally.
  }
}
