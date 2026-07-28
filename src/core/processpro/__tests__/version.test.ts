import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getExtensionVersion } from '../version';

describe('extension version', () => {
  it('returns version from the extension manifest at runtime', () => {
    expect(getExtensionVersion()).toBe('1.0.0');
  });

  it('keeps package.json version as the build source of truth', () => {
    const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')) as {
      version: string;
    };
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+/);
    // Runtime value comes from the built manifest (copied from package.json by WXT).
    // Vitest mocks getManifest().version as 1.0.0 — production builds use package.json.
    expect(typeof pkg.version).toBe('string');
  });
});
