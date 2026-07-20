"use client";

import { useEffect } from "react";

const updateCheckIntervalMs = 60 * 60 * 1000;

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
      return;
    }

    let hasRefreshed = false;
    let isMounted = true;
    const shouldRefreshOnControllerChange = Boolean(navigator.serviceWorker.controller);
    let updateTimer: number | undefined;

    const handleControllerChange = () => {
      if (!shouldRefreshOnControllerChange || hasRefreshed) {
        return;
      }

      hasRefreshed = true;
      window.location.reload();
    };

    const askWaitingWorkerToActivate = (registration: ServiceWorkerRegistration) => {
      registration.waiting?.postMessage({ type: "SKIP_WAITING" });
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    void navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        if (!isMounted) {
          return;
        }

        askWaitingWorkerToActivate(registration);
        void registration.update();

        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;

          installingWorker?.addEventListener("statechange", () => {
            if (
              installingWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              askWaitingWorkerToActivate(registration);
            }
          });
        });

        updateTimer = window.setInterval(() => {
          void registration.update();
        }, updateCheckIntervalMs);
      })
      .catch(() => {
        // Installation support should never block the authenticated web app.
      });

    return () => {
      isMounted = false;
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);

      if (updateTimer) {
        window.clearInterval(updateTimer);
      }
    };
  }, []);

  return null;
}
