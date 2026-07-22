"use client";

import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export const offlineMutationMessage = "Available when you're back online.";

type OnlineStatusValue = {
  isOnline: boolean;
};

const OnlineStatusContext = createContext<OnlineStatusValue>({ isOnline: true });

export function OnlineStatusProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(getBrowserOnlineStatus);

  useEffect(() => {
    function updateOnlineStatus() {
      setIsOnline(getBrowserOnlineStatus());
    }

    updateOnlineStatus();
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  const value = useMemo(() => ({ isOnline }), [isOnline]);

  return <OnlineStatusContext.Provider value={value}>{children}</OnlineStatusContext.Provider>;
}

export function useOnlineStatus() {
  return useContext(OnlineStatusContext);
}

export function OfflineStatusBanner() {
  const { isOnline } = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="mb-4 rounded-md border border-primary/30 bg-primary/12 px-3.5 py-2.5 text-sm font-semibold leading-5 text-foreground shadow-sm sm:mb-5 sm:px-4"
      role="status"
    >
      You&apos;re offline. Changes are unavailable until you reconnect.
    </div>
  );
}

export function OfflineMutationNotice({ className }: { className?: string }) {
  const { isOnline } = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <p
      className={cn("text-xs font-medium leading-5 text-muted-foreground", className)}
      role="note"
    >
      {offlineMutationMessage}
    </p>
  );
}

type OnlineOnlyLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  children: ReactNode;
  href: string;
};

export function OnlineOnlyLink({
  children,
  className,
  href,
  onClick,
  title,
  ...props
}: OnlineOnlyLinkProps) {
  const { isOnline } = useOnlineStatus();
  const isDisabled = !isOnline;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (isDisabled) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
  }

  return (
    <Link
      {...props}
      aria-disabled={isDisabled || undefined}
      className={cn(className, isDisabled && "cursor-not-allowed opacity-60")}
      href={href}
      onClick={handleClick}
      title={isDisabled ? offlineMutationMessage : title}
    >
      {children}
    </Link>
  );
}

function getBrowserOnlineStatus() {
  if (typeof navigator === "undefined") {
    return true;
  }

  return navigator.onLine;
}
