import { describe, expect, it } from 'vitest';
import { PING_MESSAGE_TYPE, WEB_MESSAGE_SOURCE } from '../protocol';
import { validateProcessProPing } from '../validate-ping';

describe('validateProcessProPing', () => {
  it('accepts a valid ProcessPro ping without requestId', () => {
    const result = validateProcessProPing({
      source: WEB_MESSAGE_SOURCE,
      type: PING_MESSAGE_TYPE,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.message.source).toBe(WEB_MESSAGE_SOURCE);
      expect(result.message.type).toBe(PING_MESSAGE_TYPE);
      expect(result.message.requestId).toBeUndefined();
    }
  });

  it('accepts a valid ProcessPro ping with requestId', () => {
    const result = validateProcessProPing({
      source: WEB_MESSAGE_SOURCE,
      type: PING_MESSAGE_TYPE,
      requestId: 'req-123',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.message.requestId).toBe('req-123');
    }
  });

  it('rejects malformed messages', () => {
    expect(validateProcessProPing(null).ok).toBe(false);
    expect(validateProcessProPing('ping').ok).toBe(false);
    expect(validateProcessProPing(undefined).ok).toBe(false);
  });

  it('rejects incorrect source', () => {
    const result = validateProcessProPing({
      source: 'PROCESSPRO',
      type: PING_MESSAGE_TYPE,
    });
    expect(result).toEqual({ ok: false, reason: 'incorrect_source' });
  });

  it('rejects incorrect message type', () => {
    const result = validateProcessProPing({
      source: WEB_MESSAGE_SOURCE,
      type: 'WRONG_TYPE',
    });
    expect(result).toEqual({ ok: false, reason: 'incorrect_type' });
  });

  it('rejects empty requestId when provided', () => {
    const result = validateProcessProPing({
      source: WEB_MESSAGE_SOURCE,
      type: PING_MESSAGE_TYPE,
      requestId: '   ',
    });
    expect(result).toEqual({ ok: false, reason: 'invalid_request_id' });
  });

  it('rejects non-string requestId when provided', () => {
    const result = validateProcessProPing({
      source: WEB_MESSAGE_SOURCE,
      type: PING_MESSAGE_TYPE,
      requestId: 42,
    });
    expect(result).toEqual({ ok: false, reason: 'invalid_request_id' });
  });
});
