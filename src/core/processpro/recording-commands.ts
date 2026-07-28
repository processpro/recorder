import { logger } from '@/lib/logger';
import { getProcessProCaptureApi } from './capture-api';
import {
  ERROR_MESSAGE_TYPE,
  EXTENSION_MESSAGE_SOURCE,
  type ProcessProCommandResult,
  STARTED_MESSAGE_TYPE,
  STATUS_RESULT_MESSAGE_TYPE,
  STOPPED_MESSAGE_TYPE,
} from './protocol';
import { getExtensionVersion } from './version';

export type ProcessProCommandName = 'start' | 'stop' | 'status';

/**
 * Executes a ProcessPro recording command against the Mimik capture pipeline.
 * Prefer a background-registered capture API (no nested runtime messaging).
 */
export async function executeProcessProRecordingCommand(
  command: ProcessProCommandName,
  options?: { url?: string; requestId?: string },
): Promise<ProcessProCommandResult> {
  const requestId = options?.requestId;
  const api = getProcessProCaptureApi();

  try {
    if (command === 'status') {
      const state = await api.getState();
      return {
        ok: true,
        type: STATUS_RESULT_MESSAGE_TYPE,
        requestId,
        state: state.state,
        stepCount: state.stepCount,
        guideId: state.currentGuideId,
        version: getExtensionVersion(),
      };
    }

    if (command === 'start') {
      const current = await api.getState();
      if (current.state === 'RECORDING' && current.currentGuideId) {
        return {
          ok: true,
          type: STARTED_MESSAGE_TYPE,
          requestId,
          guideId: current.currentGuideId,
          stepCount: current.stepCount,
          state: current.state,
        };
      }

      let url = options?.url?.trim();
      if (!url) {
        url = await api.resolveDefaultUrl();
      }

      const started = await api.startRecording(url);
      api.openSidebar();

      logger.info('ProcessPro recording started', started.guideId);
      return {
        ok: true,
        type: STARTED_MESSAGE_TYPE,
        requestId,
        guideId: started.guideId,
        stepCount: 0,
        state: 'RECORDING',
      };
    }

    // stop
    const before = await api.getState();
    const stopped = await api.stopRecording();
    logger.info('ProcessPro recording stopped', stopped.guideId);
    return {
      ok: true,
      type: STOPPED_MESSAGE_TYPE,
      requestId,
      guideId: stopped.guideId ?? before.currentGuideId,
      stepCount: before.stepCount,
      state: 'IDLE',
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Recording command failed';
    logger.error('ProcessPro recording command failed', err);
    return {
      ok: false,
      type: ERROR_MESSAGE_TYPE,
      requestId,
      error: message,
    };
  }
}

/**
 * Builds a page-facing postMessage payload from a command result.
 */
export function toProcessProPageResponse(result: ProcessProCommandResult): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    source: EXTENSION_MESSAGE_SOURCE,
    type: result.type,
    ok: result.ok,
  };

  if (result.requestId) payload.requestId = result.requestId;
  if (result.guideId !== undefined) payload.guideId = result.guideId;
  if (result.stepCount !== undefined) payload.stepCount = result.stepCount;
  if (result.state !== undefined) payload.state = result.state;
  if (result.error !== undefined) payload.error = result.error;
  if (result.version !== undefined) payload.version = result.version;

  return payload;
}
