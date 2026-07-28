import { describe, expect, it, vi } from 'vitest';
import { createProcessProExternalMessageHandler } from '../external-messaging';
import {
  EXTENSION_MESSAGE_SOURCE,
  PING_MESSAGE_TYPE,
  PONG_MESSAGE_TYPE,
  START_MESSAGE_TYPE,
  STARTED_MESSAGE_TYPE,
  WEB_MESSAGE_SOURCE,
} from '../protocol';

vi.mock('../recording-commands', () => ({
  executeProcessProRecordingCommand: vi.fn(async () => ({
    ok: true,
    type: STARTED_MESSAGE_TYPE,
    requestId: 'ext-start',
    guideId: 'guide-9',
    stepCount: 0,
    state: 'RECORDING',
  })),
}));

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
        capabilities: ['detection', 'recording', 'export'],
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

  it('handles external start recording command', () => {
    const handler = createProcessProExternalMessageHandler();
    const sendResponse = vi.fn();

    const handled = handler(
      { type: START_MESSAGE_TYPE, source: WEB_MESSAGE_SOURCE, requestId: 'ext-start' },
      { origin: 'https://demo.processpro.io', id: 'page', url: 'https://demo.processpro.io/settings' },
      sendResponse,
    );

    expect(handled).toBe(true);
  });

  it('rejects unrelated external messages', () => {
    const handler = createProcessProExternalMessageHandler();
    const sendResponse = vi.fn();

    const handled = handler(
      { type: 'UNKNOWN_COMMAND' },
      { origin: 'https://demo.processpro.io', id: 'page' },
      sendResponse,
    );

    expect(handled).toBe(false);
    expect(sendResponse).not.toHaveBeenCalled();
  });
});
