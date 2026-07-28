import type { Browser } from '#imports';
import { browser } from '#imports';
import { logger } from '@/lib/logger';
import { onMessage } from '@/lib/messaging';
import { isAuthorisedProcessProOrigin } from './origins';
import { buildProcessProPong } from './pong';
import {
  PING_MESSAGE_TYPE,
  START_MESSAGE_TYPE,
  STATUS_MESSAGE_TYPE,
  STOP_MESSAGE_TYPE,
  WEB_MESSAGE_SOURCE,
} from './protocol';
import { executeProcessProRecordingCommand, type ProcessProCommandName } from './recording-commands';

function mapExternalType(type: unknown): ProcessProCommandName | 'ping' | null {
  if (type === PING_MESSAGE_TYPE) return 'ping';
  if (type === START_MESSAGE_TYPE) return 'start';
  if (type === STOP_MESSAGE_TYPE) return 'stop';
  if (type === STATUS_MESSAGE_TYPE) return 'status';
  return null;
}

/**
 * Handles `chrome.runtime.sendMessage(extensionId, …)` from ProcessPro pages.
 */
export function createProcessProExternalMessageHandler() {
  return (
    message: unknown,
    sender: Browser.runtime.MessageSender,
    sendResponse: (response?: unknown) => void,
  ): boolean => {
    const senderOrigin = sender.origin ?? (sender.url ? safeOrigin(sender.url) : undefined);
    if (!senderOrigin || !isAuthorisedProcessProOrigin(senderOrigin)) {
      logger.debug('ProcessPro external message rejected — unauthorised sender', senderOrigin);
      return false;
    }

    if (!message || typeof message !== 'object') return false;
    const record = message as Record<string, unknown>;

    if (record.source !== undefined && record.source !== WEB_MESSAGE_SOURCE) {
      return false;
    }

    const mapped = mapExternalType(record.type);
    if (!mapped) return false;

    const requestId = typeof record.requestId === 'string' ? record.requestId : undefined;

    if (mapped === 'ping') {
      sendResponse(buildProcessProPong(requestId));
      return true;
    }

    const url = typeof record.url === 'string' ? record.url : sender.url;
    executeProcessProRecordingCommand(mapped, { requestId, url })
      .then(sendResponse)
      .catch((err: unknown) => {
        sendResponse({
          ok: false,
          type: 'PROCESS_PRO_RECORDER_ERROR',
          requestId,
          error: err instanceof Error ? err.message : 'Command failed',
        });
      });

    return true;
  };
}

/**
 * Registers Mimik-protocol ProcessPro commands + external (page runtime) messaging.
 */
export function registerProcessProBackgroundBridge(): () => void {
  const removeProcessProCommand = onMessage('processProCommand', async ({ data }) => {
    return executeProcessProRecordingCommand(data.command, {
      requestId: data.requestId,
      url: data.url,
    });
  });

  const externalHandler = createProcessProExternalMessageHandler();
  const external = browser.runtime.onMessageExternal;
  if (external?.addListener) {
    external.addListener(externalHandler);
    logger.info('ProcessPro external messaging registered');
  } else {
    logger.warn('ProcessPro external messaging unavailable in this browser');
  }

  logger.info('ProcessPro processProCommand messaging registered');

  return () => {
    removeProcessProCommand();
    external?.removeListener?.(externalHandler);
  };
}

/** @deprecated Use {@link registerProcessProBackgroundBridge} */
export const registerProcessProExternalMessaging = registerProcessProBackgroundBridge;

/** @deprecated Internal channel removed — use Mimik `processProCommand`. */
export function createProcessProInternalMessageHandler() {
  return (): boolean => false;
}

function safeOrigin(url: string): string | undefined {
  try {
    return new URL(url).origin;
  } catch {
    return undefined;
  }
}
