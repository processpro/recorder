/**
 * @vitest-environment happy-dom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleProcessProWindowMessage, startProcessProDetection } from '../detection';
import * as origins from '../origins';
import {
  DOM_VERSION_ATTRIBUTE,
  EXTENSION_MESSAGE_SOURCE,
  PING_MESSAGE_TYPE,
  PONG_MESSAGE_TYPE,
  WEB_MESSAGE_SOURCE,
} from '../protocol';

describe('handleProcessProWindowMessage', () => {
  const sourceWindow = {};

  it('answers a valid ProcessPro ping with matching requestId and version', () => {
    const postMessage = vi.fn();

    const handled = handleProcessProWindowMessage(
      {
        source: sourceWindow,
        origin: 'https://demo.processpro.io',
        data: {
          source: WEB_MESSAGE_SOURCE,
          type: PING_MESSAGE_TYPE,
          requestId: 'unique-request-id',
        },
      },
      {
        pageOrigin: 'https://demo.processpro.io',
        postMessage,
      },
      sourceWindow,
    );

    expect(handled).toBe(true);
    expect(postMessage).toHaveBeenCalledWith(
      {
        source: EXTENSION_MESSAGE_SOURCE,
        type: PONG_MESSAGE_TYPE,
        version: '1.0.0',
        capabilities: ['detection', 'recording', 'export'],
        requestId: 'unique-request-id',
      },
      'https://demo.processpro.io',
    );
  });

  it('ignores ping with incorrect source', () => {
    const postMessage = vi.fn();

    const handled = handleProcessProWindowMessage(
      {
        source: sourceWindow,
        origin: 'https://demo.processpro.io',
        data: { source: 'PROCESSPRO', type: PING_MESSAGE_TYPE, requestId: 'x' },
      },
      { pageOrigin: 'https://demo.processpro.io', postMessage },
      sourceWindow,
    );

    expect(handled).toBe(false);
    expect(postMessage).not.toHaveBeenCalled();
  });

  it('rejects unauthorised event origin', () => {
    const postMessage = vi.fn();

    const handled = handleProcessProWindowMessage(
      {
        source: sourceWindow,
        origin: 'https://evil.example.com',
        data: { source: WEB_MESSAGE_SOURCE, type: PING_MESSAGE_TYPE },
      },
      { pageOrigin: 'https://demo.processpro.io', postMessage },
      sourceWindow,
    );

    expect(handled).toBe(false);
    expect(postMessage).not.toHaveBeenCalled();
  });

  it('rejects when event.source is not the page window', () => {
    const postMessage = vi.fn();

    const handled = handleProcessProWindowMessage(
      {
        source: {},
        origin: 'https://demo.processpro.io',
        data: { source: WEB_MESSAGE_SOURCE, type: PING_MESSAGE_TYPE },
      },
      { pageOrigin: 'https://demo.processpro.io', postMessage },
      sourceWindow,
    );

    expect(handled).toBe(false);
    expect(postMessage).not.toHaveBeenCalled();
  });
});

describe('startProcessProDetection', () => {
  let handle: ReturnType<typeof startProcessProDetection> = null;

  afterEach(() => {
    handle?.dispose();
    handle = null;
    vi.restoreAllMocks();
    document.documentElement.removeAttribute(DOM_VERSION_ATTRIBUTE);
    document.getElementById('processpro-recorder-extension')?.remove();
  });

  it('installs DOM marker when origin is authorised', () => {
    vi.spyOn(origins, 'isAuthorisedProcessProOrigin').mockReturnValue(true);

    handle = startProcessProDetection();
    expect(handle).not.toBeNull();
    expect(document.documentElement.getAttribute(DOM_VERSION_ATTRIBUTE)).toBe('1.0.0');
  });

  it('does not start on unauthorised origins', () => {
    vi.spyOn(origins, 'isAuthorisedProcessProOrigin').mockReturnValue(false);

    handle = startProcessProDetection();
    expect(handle).toBeNull();
    expect(document.documentElement.getAttribute(DOM_VERSION_ATTRIBUTE)).toBeNull();
  });
});
