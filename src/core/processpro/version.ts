import { browser } from '#imports';

/**
 * Extension version from the built manifest (single source of truth at runtime).
 * Matches package.json version after a WXT build.
 */
export function getExtensionVersion(): string {
  try {
    const version = browser.runtime.getManifest()?.version;
    return typeof version === 'string' && version.trim() ? version.trim() : '0.0.0';
  } catch {
    return '0.0.0';
  }
}
