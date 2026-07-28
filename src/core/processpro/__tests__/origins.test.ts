import { describe, expect, it } from 'vitest';
import { getExternallyConnectableMatches, isAuthorisedProcessProOrigin } from '../origins';

describe('isAuthorisedProcessProOrigin', () => {
  it('accepts authorised production ProcessPro origins', () => {
    expect(isAuthorisedProcessProOrigin('https://demo.processpro.io')).toBe(true);
    expect(isAuthorisedProcessProOrigin('https://au.processpro.io')).toBe(true);
    expect(isAuthorisedProcessProOrigin('https://processpro.io')).toBe(true);
    expect(isAuthorisedProcessProOrigin('https://my.processpro.io')).toBe(true);
  });

  it('accepts authorised development origins only when development is enabled', () => {
    expect(isAuthorisedProcessProOrigin('https://localhost:44397', { allowDevelopmentOrigins: true })).toBe(true);
    expect(isAuthorisedProcessProOrigin('http://localhost:5000', { allowDevelopmentOrigins: true })).toBe(true);
  });

  it('rejects development origins in production mode', () => {
    expect(isAuthorisedProcessProOrigin('https://localhost:44397', { allowDevelopmentOrigins: false })).toBe(false);
    expect(isAuthorisedProcessProOrigin('http://localhost:5000', { allowDevelopmentOrigins: false })).toBe(false);
  });

  it('rejects unauthorised origins', () => {
    expect(isAuthorisedProcessProOrigin('https://evil.example.com')).toBe(false);
    expect(isAuthorisedProcessProOrigin('https://processpro.io.evil.com')).toBe(false);
    expect(isAuthorisedProcessProOrigin('http://demo.processpro.io')).toBe(false);
    expect(isAuthorisedProcessProOrigin('not-a-url')).toBe(false);
  });
});

describe('getExternallyConnectableMatches', () => {
  it('includes only production matches by default', () => {
    const matches = getExternallyConnectableMatches(false);
    expect(matches).toContain('https://*.processpro.io/*');
    expect(matches).toContain('https://processpro.io/*');
    expect(matches.some((m) => m.includes('localhost'))).toBe(false);
  });

  it('includes localhost matches for development builds', () => {
    const matches = getExternallyConnectableMatches(true);
    expect(matches.some((m) => m.includes('localhost'))).toBe(true);
  });
});
