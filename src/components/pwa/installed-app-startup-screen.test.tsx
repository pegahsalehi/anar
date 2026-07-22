import type { ImgHTMLAttributes } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AuthLoading from "@/app/(auth)/loading";
import ProtectedLoading from "@/app/(protected)/loading";
import SettingsLoading from "@/app/(protected)/settings/loading";
import TodayLoading from "@/app/(protected)/today/loading";
import { InstalledAppStartupScreen } from "@/components/pwa/installed-app-startup-screen";

vi.mock("next/image", () => ({
  default: ({
    alt,
    fill: _fill,
    priority: _priority,
    src,
    unoptimized: _unoptimized,
    ...props
  }: MockImageProps) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={typeof src === "string" ? src : src.src} {...props} />
  ),
}));

type MockImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  fill?: boolean;
  priority?: boolean;
  src: string | { src: string };
  unoptimized?: boolean;
};

describe("InstalledAppStartupScreen", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    setDocumentReadyState("loading");
    setInstalledAppEnvironment({ mobile: true, standalone: true });
  });

  afterEach(() => {
    window.sessionStorage.clear();
    setDocumentReadyState("complete");
    vi.restoreAllMocks();
  });

  it("does not render the startup image during ordinary route loading", () => {
    const { container: authContainer } = render(<AuthLoading />);
    expect(authContainer.querySelector('[src="/icons/pwa/loading-page.png"]')).toBeNull();
    expect(authContainer.querySelector(".animate-pulse")).toBeInTheDocument();

    const { container: protectedContainer } = render(<ProtectedLoading />);
    expect(protectedContainer.querySelector('[src="/icons/pwa/loading-page.png"]')).toBeNull();
    expect(protectedContainer.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("keeps Today and Settings loading screens on neutral skeleton states", () => {
    const { container: todayContainer } = render(<TodayLoading />);
    expect(screen.getByText("Loading today")).toBeInTheDocument();
    expect(todayContainer.querySelector('[src="/icons/pwa/loading-page.png"]')).toBeNull();
    expect(todayContainer.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);

    const { container: settingsContainer } = render(<SettingsLoading />);
    expect(screen.getByText("Loading settings")).toBeInTheDocument();
    expect(settingsContainer.querySelector('[src="/icons/pwa/loading-page.png"]')).toBeNull();
    expect(settingsContainer.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("can appear during initial standalone mobile startup and hides as soon as loading completes", async () => {
    render(<InstalledAppStartupScreen />);

    expect(await screen.findByRole("status", { name: "Loading Anar" })).toBeInTheDocument();
    expect(document.querySelector("img")).toHaveAttribute(
      "src",
      "/icons/pwa/loading-page.png",
    );

    act(() => {
      window.dispatchEvent(new Event("load"));
    });

    await waitFor(() => {
      expect(screen.queryByRole("status", { name: "Loading Anar" })).not.toBeInTheDocument();
    });
  });

  it("appears only once during the current app session", async () => {
    const { unmount } = render(<InstalledAppStartupScreen />);

    expect(await screen.findByRole("status", { name: "Loading Anar" })).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event("load"));
    });

    await waitFor(() => {
      expect(screen.queryByRole("status", { name: "Loading Anar" })).not.toBeInTheDocument();
    });

    unmount();
    render(<InstalledAppStartupScreen />);

    expect(screen.queryByRole("status", { name: "Loading Anar" })).not.toBeInTheDocument();
  });

  it("does not reappear across client-side route changes while the root component remains mounted", async () => {
    const { rerender } = render(
      <>
        <InstalledAppStartupScreen />
        <main>Today</main>
      </>,
    );

    expect(await screen.findByRole("status", { name: "Loading Anar" })).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event("load"));
    });

    await waitFor(() => {
      expect(screen.queryByRole("status", { name: "Loading Anar" })).not.toBeInTheDocument();
    });

    rerender(
      <>
        <InstalledAppStartupScreen />
        <main>Settings</main>
      </>,
    );

    expect(screen.queryByRole("status", { name: "Loading Anar" })).not.toBeInTheDocument();
  });

  it("does not show in a normal mobile browser or on desktop", () => {
    setInstalledAppEnvironment({ mobile: true, standalone: false });
    const { unmount } = render(<InstalledAppStartupScreen />);
    expect(screen.queryByRole("status", { name: "Loading Anar" })).not.toBeInTheDocument();

    unmount();
    setInstalledAppEnvironment({ mobile: false, standalone: true });
    render(<InstalledAppStartupScreen />);
    expect(screen.queryByRole("status", { name: "Loading Anar" })).not.toBeInTheDocument();
  });

  it("detects iOS standalone mode after mount", async () => {
    setInstalledAppEnvironment({ iosStandalone: true, mobile: true, standalone: false });

    render(<InstalledAppStartupScreen />);

    expect(await screen.findByRole("status", { name: "Loading Anar" })).toBeInTheDocument();
  });

  it("does not access browser-only APIs during server rendering", () => {
    const matchMediaMock = vi.fn(window.matchMedia);
    window.matchMedia = matchMediaMock;

    expect(renderToString(<InstalledAppStartupScreen />)).toBe("");
    expect(matchMediaMock).not.toHaveBeenCalled();
  });
});

function setInstalledAppEnvironment({
  iosStandalone = false,
  mobile,
  standalone,
}: {
  iosStandalone?: boolean;
  mobile: boolean;
  standalone: boolean;
}) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches:
        (query === "(max-width: 639px)" && mobile) ||
        ((query === "(display-mode: standalone)" ||
          query === "(display-mode: fullscreen)") &&
          standalone),
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
    writable: true,
  });

  Object.defineProperty(window.navigator, "standalone", {
    configurable: true,
    value: iosStandalone,
  });
}

function setDocumentReadyState(readyState: DocumentReadyState) {
  Object.defineProperty(document, "readyState", {
    configurable: true,
    value: readyState,
  });
}
