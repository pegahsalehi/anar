import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";

type WorkerListeners = {
  activate?: (event: ExtendableEventStub) => void;
  fetch?: (event: FetchEventStub) => void;
  install?: (event: ExtendableEventStub) => void;
};

type ExtendableEventStub = {
  waitUntil: (promise: Promise<unknown>) => void;
};

type FetchEventStub = {
  request: Request;
  respondWith: (promise: Promise<Response>) => void;
};

class TestCache {
  addAllCalls: string[][] = [];
  putCalls: string[] = [];
  responses = new Map<string, Response>();

  async addAll(urls: string[]) {
    this.addAllCalls.push(urls);

    urls.forEach((url) => {
      this.responses.set(url, new Response(`cached:${url}`));
    });
  }

  async match(request: Request | string) {
    const key = typeof request === "string" ? request : new URL(request.url).pathname;
    return this.responses.get(key);
  }

  async put(request: Request, response: Response) {
    this.putCalls.push(new URL(request.url).pathname);
    this.responses.set(new URL(request.url).pathname, response);
  }
}

describe("service worker offline behavior", () => {
  it("precaches the offline fallback with public brand and PWA assets", async () => {
    const worker = createWorkerHarness();
    const installPromise = dispatchExtendableEvent(worker.listeners.install);

    await installPromise;

    expect(worker.staticCache.addAllCalls[0]).toEqual(
      expect.arrayContaining([
        "/offline.html",
        "/brand/anar-icon.png",
        "/brand/anar-logo.png",
        "/icons/pwa/icon-192.png",
        "/icons/pwa/maskable-512.png",
      ]),
    );
  });

  it("returns the fallback for failed document navigation without caching private HTML", async () => {
    const worker = createWorkerHarness({
      fetchMock: vi.fn().mockRejectedValue(new TypeError("offline")),
    });

    worker.staticCache.responses.set("/offline.html", new Response("offline fallback"));

    const response = await dispatchFetch(
      worker.listeners.fetch,
      new Request("https://anar.test/today", {
        headers: { accept: "text/html" },
      }),
    );

    await expect(response?.text()).resolves.toBe("offline fallback");
    expect(worker.staticCache.putCalls).not.toContain("/today");
  });

  it("uses network-first navigation and never stores authenticated page responses", async () => {
    const worker = createWorkerHarness({
      fetchMock: vi.fn().mockResolvedValue(new Response("private today html")),
    });

    const response = await dispatchFetch(
      worker.listeners.fetch,
      new Request("https://anar.test/today", {
        headers: { accept: "text/html" },
      }),
    );

    await expect(response?.text()).resolves.toBe("private today html");
    expect(worker.staticCache.putCalls).toEqual([]);
  });

  it("does not intercept POST requests, API requests, or Supabase-origin requests", async () => {
    const worker = createWorkerHarness();

    expect(
      dispatchFetch(
        worker.listeners.fetch,
        new Request("https://anar.test/today", { method: "POST" }),
      ),
    ).toBeUndefined();
    expect(
      dispatchFetch(worker.listeners.fetch, new Request("https://anar.test/api/health")),
    ).toBeUndefined();
    expect(
      dispatchFetch(
        worker.listeners.fetch,
        new Request("https://project.supabase.co/rest/v1/foods"),
      ),
    ).toBeUndefined();
  });

  it("removes obsolete caches during activation", async () => {
    const worker = createWorkerHarness();

    worker.cacheStore.set("anar-static-old", new TestCache());
    worker.cacheStore.set("other-cache", new TestCache());

    await dispatchExtendableEvent(worker.listeners.activate);

    expect(worker.deletedCaches).toEqual(["anar-static-old", "other-cache"]);
    expect(worker.self.clients.claim).toHaveBeenCalled();
  });
});

function createWorkerHarness({
  fetchMock = vi.fn().mockResolvedValue(new Response("network")),
}: {
  fetchMock?: typeof fetch;
} = {}) {
  const listeners: WorkerListeners = {};
  const cacheStore = new Map<string, TestCache>();
  const deletedCaches: string[] = [];
  const staticCache = new TestCache();

  cacheStore.set("anar-static-20260722-v2", staticCache);

  const self = {
    addEventListener: vi.fn((type: keyof WorkerListeners, listener: never) => {
      listeners[type] = listener;
    }),
    clients: {
      claim: vi.fn().mockResolvedValue(undefined),
    },
    location: {
      origin: "https://anar.test",
    },
    skipWaiting: vi.fn(),
  };
  const caches = {
    delete: vi.fn(async (cacheName: string) => {
      deletedCaches.push(cacheName);
      return cacheStore.delete(cacheName);
    }),
    keys: vi.fn(async () => Array.from(cacheStore.keys())),
    open: vi.fn(async (cacheName: string) => {
      let cache = cacheStore.get(cacheName);

      if (!cache) {
        cache = new TestCache();
        cacheStore.set(cacheName, cache);
      }

      return cache;
    }),
  };

  vm.runInNewContext(readFileSync(resolve(process.cwd(), "public/sw.js"), "utf8"), {
    caches,
    fetch: fetchMock,
    Promise,
    Request,
    Response,
    self,
    TypeError,
    URL,
  });

  return {
    cacheStore,
    deletedCaches,
    listeners,
    self,
    staticCache,
  };
}

function dispatchExtendableEvent(listener: WorkerListeners["install"] | undefined) {
  let waitUntilPromise: Promise<unknown> | undefined;

  listener?.({
    waitUntil: (promise) => {
      waitUntilPromise = promise;
    },
  });

  return waitUntilPromise ?? Promise.resolve();
}

function dispatchFetch(listener: WorkerListeners["fetch"] | undefined, request: Request) {
  let responsePromise: Promise<Response> | undefined;

  listener?.({
    request,
    respondWith: (promise) => {
      responsePromise = promise;
    },
  });

  return responsePromise;
}
