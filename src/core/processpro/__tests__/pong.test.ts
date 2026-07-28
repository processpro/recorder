import { describe, expect, it } from 'vitest';
import { buildProcessProPong } from '../pong';
import { EXTENSION_MESSAGE_SOURCE, PHASE1_CAPABILITIES, PONG_MESSAGE_TYPE } from '../protocol';

describe('buildProcessProPong', () => {
  it('returns ProcessPro-compatible pong with version and phase-1 capabilities', () => {
    const pong = buildProcessProPong();

    expect(pong.source).toBe(EXTENSION_MESSAGE_SOURCE);
    expect(pong.type).toBe(PONG_MESSAGE_TYPE);
    expect(pong.version).toBe('1.0.0'); // from vitest.setup mock manifest
    expect(pong.capabilities).toEqual(['detection']);
    expect(pong.capabilities).toEqual([...PHASE1_CAPABILITIES]);
    expect(pong.requestId).toBeUndefined();
  });

  it('echoes matching requestId when provided', () => {
    const pong = buildProcessProPong('unique-request-id');

    expect(pong.requestId).toBe('unique-request-id');
    expect(pong.version).toBeTruthy();
  });

  it('does not claim unfinished capabilities', () => {
    const pong = buildProcessProPong();

    expect(pong.capabilities).not.toContain('recording');
    expect(pong.capabilities).not.toContain('screenshots');
    expect(pong.capabilities).not.toContain('automaticUpload');
    expect(Array.isArray(pong.capabilities)).toBe(true);
  });
});
