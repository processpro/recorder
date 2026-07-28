import { logger } from '@/lib/logger';
import { sendMessage } from '@/lib/messaging';
import { installProcessProDomMarker, removeProcessProDomMarker } from './dom-marker';
import { isAuthorisedProcessProOrigin } from './origins';
import { buildProcessProPong } from './pong';
import {
  ERROR_MESSAGE_TYPE,
  EXPORT_MESSAGE_TYPE,
  EXTENSION_MESSAGE_SOURCE,
  START_MESSAGE_TYPE,
  STATUS_MESSAGE_TYPE,
  STOP_MESSAGE_TYPE,
  WEB_MESSAGE_SOURCE,
} from './protocol';
import { toProcessProPageResponse } from './recording-commands';
import { validateProcessProPing } from './validate-ping';

export type ProcessProBridgeHandle = {
  dispose: () => void;
};

type BridgeCommand = 'start' | 'stop' | 'status' | 'export';

function mapCommandType(type: string): BridgeCommand | null {
  if (type === START_MESSAGE_TYPE) return 'start';
  if (type === STOP_MESSAGE_TYPE) return 'stop';
  if (type === STATUS_MESSAGE_TYPE) return 'status';
  if (type === EXPORT_MESSAGE_TYPE) return 'export';
  return null;
}

function isBridgeCommandMessage(data: unknown): data is {
  source: string;
  type: string;
  requestId?: string;
  url?: string;
  guideId?: string;
} {
  if (!data || typeof data !== 'object') return false;
  const record = data as Record<string, unknown>;
  return record.source === WEB_MESSAGE_SOURCE && typeof record.type === 'string' && mapCommandType(record.type) !== null;
}

/**
 * Starts the ProcessPro page bridge on authorised origins (detection + recording + export).
 * Top-frame only.
 */
export function startProcessProBridge(): ProcessProBridgeHandle | null {
  if (window.self !== window.top) {
    return null;
  }

  const pageOrigin = window.location.origin;
  if (!isAuthorisedProcessProOrigin(pageOrigin)) {
    logger.debug('ProcessPro bridge skipped — unauthorised origin', pageOrigin);
    return null;
  }

  logger.info('ProcessPro authorised origin detected', pageOrigin);
  installProcessProDomMarker();

  function onWindowMessage(event: MessageEvent): void {
    if (event.source !== window) return;
    if (!isAuthorisedProcessProOrigin(event.origin)) return;

    const ping = validateProcessProPing(event.data);
    if (ping.ok) {
      const pong = buildProcessProPong(ping.message.requestId);
      window.postMessage(pong, pageOrigin);
      return;
    }

    if (!isBridgeCommandMessage(event.data)) return;

    const command = mapCommandType(event.data.type);
    if (!command) return;

    const requestId = typeof event.data.requestId === 'string' ? event.data.requestId : undefined;
    const url = typeof event.data.url === 'string' ? event.data.url : window.location.href;
    const guideId = typeof event.data.guideId === 'string' ? event.data.guideId : undefined;

    logger.debug('ProcessPro command', command, requestId ?? '');

    sendMessage('processProCommand', { command, requestId, url, guideId })
      .then((result) => {
        window.postMessage(toProcessProPageResponse(result), pageOrigin);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Extension command failed';
        window.postMessage(
          {
            source: EXTENSION_MESSAGE_SOURCE,
            type: ERROR_MESSAGE_TYPE,
            ok: false,
            requestId,
            error: message,
          },
          pageOrigin,
        );
      });
  }

  window.addEventListener('message', onWindowMessage);

  return {
    dispose() {
      window.removeEventListener('message', onWindowMessage);
      removeProcessProDomMarker();
    },
  };
}

/** @deprecated Use {@link startProcessProBridge} */
export const startProcessProDetection = startProcessProBridge;
