import { describe, expect, it } from 'vitest';
import { buildProcessProPong } from '../pong';
import { EXTENSION_MESSAGE_SOURCE, PING_MESSAGE_TYPE, PONG_MESSAGE_TYPE, WEB_MESSAGE_SOURCE } from '../protocol';

/**
 * Chrome and Edge share Chromium extension APIs. Detection uses WXT `browser.*`
 * wrappers and standard window.postMessage — no Chrome-only APIs.
 */
describe('Chrome and Edge compatibility', () => {
  it('uses shared protocol constants for both Chromium browsers', () => {
    expect(WEB_MESSAGE_SOURCE).toBe('processpro-web');
    expect(EXTENSION_MESSAGE_SOURCE).toBe('processpro-recorder');
    expect(PING_MESSAGE_TYPE).toBe('PROCESS_PRO_RECORDER_PING');
    expect(PONG_MESSAGE_TYPE).toBe('PROCESS_PRO_RECORDER_PONG');
  });

  it('builds the same pong payload shape for Chrome and Edge', () => {
    const pong = buildProcessProPong('compat');
    expect(pong).toMatchObject({
      source: EXTENSION_MESSAGE_SOURCE,
      type: PONG_MESSAGE_TYPE,
      requestId: 'compat',
      capabilities: ['detection'],
    });
    expect(typeof pong.version).toBe('string');
  });
});
