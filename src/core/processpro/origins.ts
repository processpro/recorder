/**
 * Authorised ProcessPro origins for detection handshake / external messaging.
 * Detection logic only runs on matching pages — never on arbitrary websites.
 */

/** Production ProcessPro host patterns (origin only, no path). */
export const PRODUCTION_ORIGIN_PATTERNS: readonly RegExp[] = [
  /^https:\/\/processpro\.io$/i,
  /^https:\/\/([a-z0-9-]+\.)*processpro\.io$/i,
];

/**
 * Development-only origins used by ProcessPro developers.
 * Included when the build is development (`serve` or `--mode development`).
 */
export const DEVELOPMENT_ORIGINS: readonly string[] = [
  'https://localhost:44397',
  'http://localhost:44397',
  'https://localhost:5001',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'https://127.0.0.1:5001',
];

/** Manifest `externally_connectable.matches` for production. */
export const PRODUCTION_EXTERNALLY_CONNECTABLE_MATCHES: readonly string[] = [
  'https://*.processpro.io/*',
  'https://processpro.io/*',
];

/** Manifest matches added for development builds only. */
export const DEVELOPMENT_EXTERNALLY_CONNECTABLE_MATCHES: readonly string[] = [
  'http://localhost/*',
  'https://localhost/*',
  'http://127.0.0.1/*',
  'https://127.0.0.1/*',
];

/**
 * True for WXT serve / development-mode builds (not production store builds).
 */
export function isDevelopmentBuild(): boolean {
  if (import.meta.env.COMMAND === 'serve') return true;
  if (import.meta.env.MODE === 'development') return true;
  return false;
}

export type OriginAuthOptions = {
  /** Override build mode — defaults to {@link isDevelopmentBuild}. */
  allowDevelopmentOrigins?: boolean;
};

/**
 * Returns whether `origin` is an authorised ProcessPro origin for the current build.
 */
export function isAuthorisedProcessProOrigin(origin: string, options?: OriginAuthOptions): boolean {
  if (!origin || typeof origin !== 'string') return false;

  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return false;
  }

  const normalised = `${parsed.protocol}//${parsed.host}`;

  if (PRODUCTION_ORIGIN_PATTERNS.some((pattern) => pattern.test(normalised))) {
    return true;
  }

  const allowDevelopmentOrigins = options?.allowDevelopmentOrigins ?? isDevelopmentBuild();
  if (allowDevelopmentOrigins && DEVELOPMENT_ORIGINS.includes(normalised)) {
    return true;
  }

  return false;
}

/**
 * Builds externally_connectable match patterns for the current build mode.
 */
export function getExternallyConnectableMatches(includeDevelopmentOrigins: boolean): string[] {
  if (includeDevelopmentOrigins) {
    return [...PRODUCTION_EXTERNALLY_CONNECTABLE_MATCHES, ...DEVELOPMENT_EXTERNALLY_CONNECTABLE_MATCHES];
  }
  return [...PRODUCTION_EXTERNALLY_CONNECTABLE_MATCHES];
}
