import { beforeEach, describe, expect, it, vi } from 'vitest';
import { registerProcessProCaptureApi, type ProcessProCaptureApi } from '../capture-api';
import { executeProcessProRecordingCommand, toProcessProPageResponse } from '../recording-commands';
import {
  ERROR_MESSAGE_TYPE,
  EXTENSION_MESSAGE_SOURCE,
  STARTED_MESSAGE_TYPE,
  STATUS_RESULT_MESSAGE_TYPE,
  STOPPED_MESSAGE_TYPE,
} from '../protocol';

function mockApi(overrides: Partial<ProcessProCaptureApi> = {}): ProcessProCaptureApi {
  return {
    getState: vi.fn(async () => ({ state: 'IDLE', stepCount: 0, currentGuideId: null })),
    startRecording: vi.fn(async () => ({ guideId: 'guide-1' })),
    stopRecording: vi.fn(async () => ({ success: true, guideId: 'guide-1' })),
    openSidebar: vi.fn(),
    resolveDefaultUrl: vi.fn(async () => 'https://demo.processpro.io/settings'),
    ...overrides,
  };
}

describe('executeProcessProRecordingCommand', () => {
  beforeEach(() => {
    registerProcessProCaptureApi(mockApi());
  });

  it('starts recording and opens the side panel', async () => {
    const api = mockApi();
    registerProcessProCaptureApi(api);

    const result = await executeProcessProRecordingCommand('start', {
      requestId: 'r1',
      url: 'https://demo.processpro.io/settings',
    });

    expect(result).toMatchObject({
      ok: true,
      type: STARTED_MESSAGE_TYPE,
      requestId: 'r1',
      guideId: 'guide-1',
      state: 'RECORDING',
    });
    expect(api.startRecording).toHaveBeenCalledWith('https://demo.processpro.io/settings');
    expect(api.openSidebar).toHaveBeenCalled();
  });

  it('stops recording and returns prior step count', async () => {
    const api = mockApi({
      getState: vi.fn(async () => ({
        state: 'RECORDING',
        stepCount: 4,
        currentGuideId: 'guide-1',
      })),
      stopRecording: vi.fn(async () => ({ success: true, guideId: 'guide-1' })),
    });
    registerProcessProCaptureApi(api);

    const result = await executeProcessProRecordingCommand('stop', { requestId: 'r2' });

    expect(result).toMatchObject({
      ok: true,
      type: STOPPED_MESSAGE_TYPE,
      requestId: 'r2',
      guideId: 'guide-1',
      stepCount: 4,
      state: 'IDLE',
    });
  });

  it('returns status snapshot', async () => {
    registerProcessProCaptureApi(
      mockApi({
        getState: vi.fn(async () => ({ state: 'RECORDING', stepCount: 2, currentGuideId: 'g' })),
      }),
    );

    const result = await executeProcessProRecordingCommand('status');

    expect(result.type).toBe(STATUS_RESULT_MESSAGE_TYPE);
    expect(result.stepCount).toBe(2);
    expect(result.guideId).toBe('g');
  });

  it('returns error payload when start fails', async () => {
    registerProcessProCaptureApi(
      mockApi({
        startRecording: vi.fn(async () => {
          throw new Error('capture blocked');
        }),
      }),
    );

    const result = await executeProcessProRecordingCommand('start', { url: 'https://example.com' });

    expect(result).toMatchObject({
      ok: false,
      type: ERROR_MESSAGE_TYPE,
      error: 'capture blocked',
    });
  });

  it('requires guideId for export', async () => {
    const result = await executeProcessProRecordingCommand('export', { requestId: 'e1' });

    expect(result).toMatchObject({
      ok: false,
      type: ERROR_MESSAGE_TYPE,
      error: 'guideId is required to export a recording',
    });
  });
});

describe('toProcessProPageResponse', () => {
  it('maps result fields for postMessage', () => {
    const payload = toProcessProPageResponse({
      ok: true,
      type: STARTED_MESSAGE_TYPE,
      requestId: 'r',
      guideId: 'g1',
      stepCount: 0,
      state: 'RECORDING',
    });

    expect(payload).toEqual({
      source: EXTENSION_MESSAGE_SOURCE,
      type: STARTED_MESSAGE_TYPE,
      ok: true,
      requestId: 'r',
      guideId: 'g1',
      stepCount: 0,
      state: 'RECORDING',
    });
  });
});
