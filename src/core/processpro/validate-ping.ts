import { PING_MESSAGE_TYPE, type ProcessProPingMessage, WEB_MESSAGE_SOURCE } from './protocol';

export type PingValidationResult =
  | { ok: true; message: ProcessProPingMessage }
  | { ok: false; reason: 'malformed' | 'incorrect_source' | 'incorrect_type' | 'invalid_request_id' };

/**
 * Validates a page-level ProcessPro ping.
 *
 * `requestId` is optional for ProcessPro Settings compatibility (current web client
 * does not send it). When present it must be a non-empty string.
 */
export function validateProcessProPing(data: unknown): PingValidationResult {
  if (!data || typeof data !== 'object') {
    return { ok: false, reason: 'malformed' };
  }

  const record = data as Record<string, unknown>;

  if (record.source !== WEB_MESSAGE_SOURCE) {
    return { ok: false, reason: 'incorrect_source' };
  }

  if (record.type !== PING_MESSAGE_TYPE) {
    return { ok: false, reason: 'incorrect_type' };
  }

  if ('requestId' in record && record.requestId !== undefined && record.requestId !== null) {
    if (typeof record.requestId !== 'string' || !record.requestId.trim()) {
      return { ok: false, reason: 'invalid_request_id' };
    }
  }

  const message: ProcessProPingMessage = {
    source: WEB_MESSAGE_SOURCE,
    type: PING_MESSAGE_TYPE,
  };

  if (typeof record.requestId === 'string' && record.requestId.trim()) {
    message.requestId = record.requestId.trim();
  }

  return { ok: true, message };
}
