import { logger } from '@/lib/logger';
import { sendMessage } from '@/lib/messaging';
import { installProcessProDomMarker, removeProcessProDomMarker } from './dom-marker';
import { isAuthorisedProcessProOrigin } from './origins';
import { buildProcessProPong } from './pong';
import {
  ERROR_MESSAGE_TYPE,
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

type RecordingCommand = 'start' | 'stop' | 'status';

function mapCommandType(type: string): RecordingCommand | null {
  if (type === START_MESSAGE_TYPE) return 'start';
  if (type === STOP_MESSAGE_TYPE) return 'stop';
  if (type === STATUS_MESSAGE_TYPE) return 'status';
  return null;
}

function isRecordingCommandMessage(data: unknown): data is {
  source: string;
  type: string;
  requestId?: string;
  url?: string;
} {
  if (!data || typeof data !== 'object') return false;
  const record = data as Record<string, unknown>;
  return record.source === WEB_MESSAGE_SOURCE && typeof record.type === 'string' && mapCommandType(record.type) !== null;
}

/**
 * Starts the ProcessPro page bridge on authorised origins (detection + recording commands).
 * Top-frame only.
 *
 * Recording commands use `@webext-core/messaging` (`processProCommand`) so they are not
 * rejected as unknown raw `runtime.sendMessage` payloads.
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

    if (!isRecordingCommandMessage(event.data)) return;

    const command = mapCommandType(event.data.type);
    if (!command) return;

    const requestId = typeof event.data.requestId === 'string' ? event.data.requestId : undefined;
    const url = typeof event.data.url === 'string' ? event.data.url : window.location.href;

    logger.debug('ProcessPro recording command', command, requestId ?? '');

    sendMessage('processProCommand', { command, requestId, url })
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
