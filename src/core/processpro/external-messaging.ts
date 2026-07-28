import type { Browser } from '#imports';
import { browser } from '#imports';
import { logger } from '@/lib/logger';
import { isAuthorisedProcessProOrigin } from './origins';
import { buildProcessProPong } from './pong';
import { PING_MESSAGE_TYPE, WEB_MESSAGE_SOURCE } from './protocol';

type ExternalMessageHandler = (
  message: unknown,
  sender: Browser.runtime.MessageSender,
  sendResponse: (response?: unknown) => void,
) => boolean;

/**
 * Handles `chrome.runtime.sendMessage(extensionId, …)` pings from ProcessPro
 * when `externally_connectable` is configured and ExtensionId is set in ProcessPro.
 */
export function createProcessProExternalMessageHandler(): ExternalMessageHandler {
  return (message, sender, sendResponse) => {
    const senderOrigin = sender.origin ?? (sender.url ? safeOrigin(sender.url) : undefined);
    if (!senderOrigin || !isAuthorisedProcessProOrigin(senderOrigin)) {
      logger.debug('ProcessPro external ping rejected — unauthorised sender', senderOrigin);
      return false;
    }

    if (!message || typeof message !== 'object') {
      return false;
    }

    const record = message as Record<string, unknown>;
    if (record.type !== PING_MESSAGE_TYPE) {
      return false;
    }

    // ProcessPro sends { type, source }; source may be omitted by future callers.
    if (record.source !== undefined && record.source !== WEB_MESSAGE_SOURCE) {
      return false;
    }

    if (
      'requestId' in record &&
      record.requestId !== undefined &&
      record.requestId !== null &&
      (typeof record.requestId !== 'string' || !record.requestId.trim())
    ) {
      return false;
    }

    const requestId = typeof record.requestId === 'string' ? record.requestId : undefined;
    const pong = buildProcessProPong(requestId);
    logger.debug('ProcessPro external pong sent', pong.version);
    sendResponse(pong);
    return true;
  };
}

/**
 * Registers the external ProcessPro ping handler on the background service worker.
 */
export function registerProcessProExternalMessaging(): () => void {
  const external = browser.runtime.onMessageExternal;
  if (!external?.addListener) {
    logger.warn('ProcessPro external messaging unavailable in this browser');
    return () => {};
  }

  const handler = createProcessProExternalMessageHandler();
  external.addListener(handler);
  logger.info('ProcessPro external messaging registered');
  return () => {
    external.removeListener(handler);
  };
}

function safeOrigin(url: string): string | undefined {
  try {
    return new URL(url).origin;
  } catch {
    return undefined;
  }
}
