/**
 * Shared ProcessPro ↔ Recorder detection contract.
 *
 * Must stay aligned with ProcessPro `RecorderExtensionProtocol` /
 * `screen-recorder.js` (ezymapps). Do not rename fields without updating ProcessPro.
 */

/** Page → extension ping source (ProcessPro web). */
export const WEB_MESSAGE_SOURCE = 'processpro-web';

/** Extension → page pong source. */
export const EXTENSION_MESSAGE_SOURCE = 'processpro-recorder';

/** Ping message type sent by ProcessPro. */
export const PING_MESSAGE_TYPE = 'PROCESS_PRO_RECORDER_PING';

/** Pong message type returned by the extension. */
export const PONG_MESSAGE_TYPE = 'PROCESS_PRO_RECORDER_PONG';

/**
 * DOM attribute ProcessPro reads on `<html>` / `<body>` for installed version.
 * Value is the extension manifest version string (e.g. "1.0.5").
 */
export const DOM_VERSION_ATTRIBUTE = 'data-processpro-recorder-version';

/** Optional hidden marker element id (non-visual fallback). */
export const DOM_MARKER_ELEMENT_ID = 'processpro-recorder-extension';

/**
 * Phase 1 capabilities as a string list — ProcessPro expects `Array.isArray(capabilities)`.
 * Only detection is implemented; do not advertise unfinished features.
 */
export const PHASE1_CAPABILITIES = ['detection'] as const;

export type ProcessProPingMessage = {
  source: typeof WEB_MESSAGE_SOURCE;
  type: typeof PING_MESSAGE_TYPE;
  /** Optional today — ProcessPro Settings does not yet send requestId. */
  requestId?: string;
};

export type ProcessProPongMessage = {
  source: typeof EXTENSION_MESSAGE_SOURCE;
  type: typeof PONG_MESSAGE_TYPE;
  version: string;
  capabilities: readonly string[];
  requestId?: string;
};

export type ProcessProExternalPing = {
  type: typeof PING_MESSAGE_TYPE;
  source?: string;
  requestId?: string;
};
