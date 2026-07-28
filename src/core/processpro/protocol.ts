/**
 * Shared ProcessPro ↔ Recorder contract.
 *
 * Must stay aligned with ProcessPro `RecorderExtensionProtocol` /
 * `screen-recorder.js` (ezymapps). Do not rename fields without updating ProcessPro.
 */

/** Page → extension message source (ProcessPro web). */
export const WEB_MESSAGE_SOURCE = 'processpro-web';

/** Extension → page message source. */
export const EXTENSION_MESSAGE_SOURCE = 'processpro-recorder';

/** Ping message type sent by ProcessPro. */
export const PING_MESSAGE_TYPE = 'PROCESS_PRO_RECORDER_PING';

/** Pong message type returned by the extension. */
export const PONG_MESSAGE_TYPE = 'PROCESS_PRO_RECORDER_PONG';

/** Start recording request from ProcessPro. */
export const START_MESSAGE_TYPE = 'PROCESS_PRO_RECORDER_START';

/** Stop recording request from ProcessPro. */
export const STOP_MESSAGE_TYPE = 'PROCESS_PRO_RECORDER_STOP';

/** Status request from ProcessPro. */
export const STATUS_MESSAGE_TYPE = 'PROCESS_PRO_RECORDER_STATUS';

/** Recording started response. */
export const STARTED_MESSAGE_TYPE = 'PROCESS_PRO_RECORDER_STARTED';

/** Recording stopped response. */
export const STOPPED_MESSAGE_TYPE = 'PROCESS_PRO_RECORDER_STOPPED';

/** Status response. */
export const STATUS_RESULT_MESSAGE_TYPE = 'PROCESS_PRO_RECORDER_STATUS_RESULT';

/** Error response. */
export const ERROR_MESSAGE_TYPE = 'PROCESS_PRO_RECORDER_ERROR';

/**
 * DOM attribute ProcessPro reads on `<html>` / `<body>` for installed version.
 */
export const DOM_VERSION_ATTRIBUTE = 'data-processpro-recorder-version';

/** Optional hidden marker element id (non-visual fallback). */
export const DOM_MARKER_ELEMENT_ID = 'processpro-recorder-extension';

/**
 * @deprecated Content → background now uses Mimik `processProCommand` messaging.
 * Kept only so older docs/tests referencing the name still compile.
 */
export const INTERNAL_CHANNEL = 'processpro';

/**
 * Phase 2 capabilities — ProcessPro expects `Array.isArray(capabilities)`.
 * Upload / screenshots hand-off are not advertised yet.
 */
export const PHASE2_CAPABILITIES = ['detection', 'recording'] as const;

/** @deprecated Use PHASE2_CAPABILITIES */
export const PHASE1_CAPABILITIES = PHASE2_CAPABILITIES;

export type ProcessProPingMessage = {
  source: typeof WEB_MESSAGE_SOURCE;
  type: typeof PING_MESSAGE_TYPE;
  requestId?: string;
};

export type ProcessProPongMessage = {
  source: typeof EXTENSION_MESSAGE_SOURCE;
  type: typeof PONG_MESSAGE_TYPE;
  version: string;
  capabilities: readonly string[];
  requestId?: string;
};

export type ProcessProRecordingCommandType =
  | typeof START_MESSAGE_TYPE
  | typeof STOP_MESSAGE_TYPE
  | typeof STATUS_MESSAGE_TYPE;

export type ProcessProRecordingCommand = {
  source: typeof WEB_MESSAGE_SOURCE;
  type: ProcessProRecordingCommandType;
  requestId?: string;
  /** Optional start URL; defaults to the ProcessPro page URL. */
  url?: string;
};

export type ProcessProCommandResult = {
  ok: boolean;
  type: string;
  requestId?: string;
  guideId?: string | null;
  stepCount?: number;
  state?: string;
  error?: string;
  version?: string;
  capabilities?: readonly string[];
};
