const siteUrlEnvVar = "NEXT_PUBLIC_SITE_URL";
const developmentFallbackUrl = "http://localhost:3000";
const localHostnames = new Set(["localhost", "127.0.0.1", "::1"]);

export class ApplicationUrlConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApplicationUrlConfigurationError";
  }
}

export function getCanonicalApplicationUrl(env: NodeJS.ProcessEnv = process.env) {
  const configuredUrl = env[siteUrlEnvVar]?.trim();
  const allowLocalhost = allowsLocalhostFallback(env);

  if (!configuredUrl) {
    if (allowLocalhost) {
      return developmentFallbackUrl;
    }

    throw new ApplicationUrlConfigurationError(
      `${siteUrlEnvVar} must be set to the production application URL.`,
    );
  }

  return normalizeApplicationUrl(configuredUrl, { allowLocalhost });
}

export function createApplicationUrl(
  pathname: `/${string}`,
  searchParams: Record<string, string | number | boolean | null | undefined> = {},
) {
  const url = new URL(pathname, `${getCanonicalApplicationUrl()}/`);

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

function normalizeApplicationUrl(rawUrl: string, { allowLocalhost }: { allowLocalhost: boolean }) {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    throw new ApplicationUrlConfigurationError(
      `${siteUrlEnvVar} must be a valid absolute URL.`,
    );
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new ApplicationUrlConfigurationError(
      `${siteUrlEnvVar} must use http or https.`,
    );
  }

  if (url.username || url.password || url.search || url.hash) {
    throw new ApplicationUrlConfigurationError(
      `${siteUrlEnvVar} must be an origin URL without credentials, query, or hash.`,
    );
  }

  if (url.pathname !== "/" && url.pathname !== "") {
    throw new ApplicationUrlConfigurationError(
      `${siteUrlEnvVar} must not include an application path.`,
    );
  }

  const isLocalhost = localHostnames.has(url.hostname);

  if (!allowLocalhost && isLocalhost) {
    throw new ApplicationUrlConfigurationError(
      `${siteUrlEnvVar} cannot point to localhost in production.`,
    );
  }

  if (!allowLocalhost && url.protocol !== "https:") {
    throw new ApplicationUrlConfigurationError(
      `${siteUrlEnvVar} must use https in production.`,
    );
  }

  return url.origin;
}

function allowsLocalhostFallback(env: NodeJS.ProcessEnv) {
  return env.NODE_ENV !== "production";
}
