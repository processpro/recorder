import { logger } from '@/lib/logger';
import { installProcessProDomMarker, removeProcessProDomMarker } from './dom-marker';
import { isAuthorisedProcessProOrigin } from './origins';
import { buildProcessProPong } from './pong';
import { validateProcessProPing } from './validate-ping';

export type ProcessProDetectionHandle = {
  dispose: () => void;
};

export type ProcessProMessageContext = {
  /** Origin of the page hosting the content script. */
  pageOrigin: string;
  /** postMessage bound to the page window. */
  postMessage: (message: unknown, targetOrigin: string) => void;
};

/**
 * Handles a single window `message` event for the ProcessPro detection handshake.
 * Exported for unit tests — production wiring uses {@link startProcessProDetection}.
 */
export function handleProcessProWindowMessage(
  event: Pick<MessageEvent, 'source' | 'origin' | 'data'>,
  context: ProcessProMessageContext,
  sourceWindow: unknown,
): boolean {
  if (event.source !== sourceWindow) return false;

  if (!isAuthorisedProcessProOrigin(event.origin)) {
    logger.debug('ProcessPro ping rejected — unauthorised origin', event.origin);
    return false;
  }

  if (!isAuthorisedProcessProOrigin(context.pageOrigin)) {
    return false;
  }

  const validation = validateProcessProPing(event.data);
  if (!validation.ok) {
    logger.debug('ProcessPro ping rejected —', validation.reason);
    return false;
  }

  logger.debug('ProcessPro ping received', validation.message.requestId ?? '(no requestId)');
  const pong = buildProcessProPong(validation.message.requestId);
  context.postMessage(pong, context.pageOrigin);
  logger.debug('ProcessPro pong sent', pong.version);
  return true;
}

/**
 * Starts ProcessPro detection on the current page when the origin is authorised.
 * Top-frame only — nested frames do not install markers or answer pings.
 */
export function startProcessProDetection(): ProcessProDetectionHandle | null {
  if (window.self !== window.top) {
    return null;
  }

  const pageOrigin = window.location.origin;
  if (!isAuthorisedProcessProOrigin(pageOrigin)) {
    logger.debug('ProcessPro detection skipped — unauthorised origin', pageOrigin);
    return null;
  }

  logger.info('ProcessPro authorised origin detected', pageOrigin);
  installProcessProDomMarker();
  logger.debug('ProcessPro DOM marker installed');

  function onWindowMessage(event: MessageEvent): void {
    handleProcessProWindowMessage(
      event,
      {
        pageOrigin,
        postMessage: (message, targetOrigin) => window.postMessage(message, targetOrigin),
      },
      window,
    );
  }

  window.addEventListener('message', onWindowMessage);

  return {
    dispose() {
      window.removeEventListener('message', onWindowMessage);
      removeProcessProDomMarker();
    },
  };
}
