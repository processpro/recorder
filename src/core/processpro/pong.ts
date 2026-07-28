import {
  EXTENSION_MESSAGE_SOURCE,
  PHASE1_CAPABILITIES,
  PONG_MESSAGE_TYPE,
  type ProcessProPongMessage,
} from './protocol';
import { getExtensionVersion } from './version';

/**
 * Builds a ProcessPro-compatible pong payload.
 * Uses `version` (not extensionVersion) because ProcessPro Settings reads `data.version`.
 */
export function buildProcessProPong(requestId?: string): ProcessProPongMessage {
  const pong: ProcessProPongMessage = {
    source: EXTENSION_MESSAGE_SOURCE,
    type: PONG_MESSAGE_TYPE,
    version: getExtensionVersion(),
    capabilities: [...PHASE1_CAPABILITIES],
  };

  if (typeof requestId === 'string' && requestId.trim()) {
    pong.requestId = requestId.trim();
  }

  return pong;
}
