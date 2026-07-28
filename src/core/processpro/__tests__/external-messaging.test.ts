import { describe, expect, it, vi } from 'vitest';
import { createProcessProExternalMessageHandler } from '../external-messaging';
import { EXTENSION_MESSAGE_SOURCE, PING_MESSAGE_TYPE, PONG_MESSAGE_TYPE, WEB_MESSAGE_SOURCE } from '../protocol';

describe('createProcessProExternalMessageHandler', () => {
  it('answers external ping from authorised ProcessPro origin', () => {
    const handler = createProcessProExternalMessageHandler();
    const sendResponse = vi.fn();

    const handled = handler(
      { type: PING_MESSAGE_TYPE, source: WEB_MESSAGE_SOURCE, requestId: 'ext-1' },
      { origin: 'https://demo.processpro.io', id: 'page', url: 'https://demo.processpro.io/settings' },
      sendResponse,
    );

    expect(handled).toBe(true);
    expect(sendResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        source: EXTENSION_MESSAGE_SOURCE,
        type: PONG_MESSAGE_TYPE,
        requestId: 'ext-1',
        version: '1.0.0',
        capabilities: ['detection'],
      }),
    );
  });

  it('rejects invalid external sender origin', () => {
    const handler = createProcessProExternalMessageHandler();
    const sendResponse = vi.fn();

    const handled = handler(
      { type: PING_MESSAGE_TYPE, source: WEB_MESSAGE_SOURCE },
      { origin: 'https://evil.example.com', id: 'page' },
      sendResponse,
    );

    expect(handled).toBe(false);
    expect(sendResponse).not.toHaveBeenCalled();
  });

  it('rejects non-ping external messages', () => {
    const handler = createProcessProExternalMessageHandler();
    const sendResponse = vi.fn();

    const handled = handler(
      { type: 'START_RECORDING' },
      { origin: 'https://demo.processpro.io', id: 'page' },
      sendResponse,
    );

    expect(handled).toBe(false);
    expect(sendResponse).not.toHaveBeenCalled();
  });
});
