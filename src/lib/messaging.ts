import { defineExtensionMessaging } from '@webext-core/messaging';
import type { DOMContext } from '@/core/capture/dom/context';
import type { CaptureStateValue } from '@/core/capture/machine';
import type { ElementMeta } from '@/core/guides/types';

export interface GetStateResponse {
  state: CaptureStateValue;
  stepCount: number;
  currentGuideId: string | null;
}

export interface StartRecordingData {
  url: string;
}

export interface StartRecordingResponse {
  guideId: string;
}

export interface StopRecordingResponse {
  success: boolean;
  guideId?: string;
}

export interface CaptureStepData {
  guideId: string;
  action: string;
  elementMeta: ElementMeta;
  domContext?: DOMContext;
}

export type CaptureStepResponse = { stepId: string } | { ignored: true } | { error: string };

export interface UpdateInputStepData {
  stepId: string;
  description: string;
  inputValue?: string;
}

export interface UpdateInputStepResponse {
  updated: boolean;
}

export interface FinalizeInputStepData {
  stepId: string;
  elementMeta: ElementMeta;
  domContext?: DOMContext;
}

export interface FinalizeInputStepResponse {
  updated: boolean;
}

export interface StartGuideMeData {
  guideId: string;
}

export interface StartGuideMeResponse {
  started: boolean;
  error?: string;
}

export interface GuideMeStepCompletedData {
  stepIndex: number;
}

export interface GuideMeStepCompletedResponse {
  advanced: boolean;
  completed?: boolean;
}

export interface GuideMe_CancelResponse {
  cancelled: boolean;
}

export interface GuideMe_PrevData {
  stepIndex: number;
}

export interface GuideMe_PrevResponse {
  moved: boolean;
}

export interface EnterBlurModeResponse {
  entered: boolean;
}

export interface ExitBlurModeResponse {
  exited: boolean;
}

/** ProcessPro Settings → background recording bridge (avoids raw runtime payloads). */
export interface ProcessProCommandData {
  command: 'start' | 'stop' | 'status';
  requestId?: string;
  url?: string;
}

export interface ProcessProCommandResponse {
  ok: boolean;
  type: string;
  requestId?: string;
  guideId?: string | null;
  stepCount?: number;
  state?: string;
  error?: string;
  version?: string;
  capabilities?: readonly string[];
}

interface MimikProtocol {
  getState(): GetStateResponse;
  startRecording(data: StartRecordingData): StartRecordingResponse;
  stopRecording(): StopRecordingResponse;
  captureStep(data: CaptureStepData): CaptureStepResponse;
  updateInputStep(data: UpdateInputStepData): UpdateInputStepResponse;
  finalizeInputStep(data: FinalizeInputStepData): FinalizeInputStepResponse;
  startGuideMe(data: StartGuideMeData): StartGuideMeResponse;
  guideMeStepCompleted(data: GuideMeStepCompletedData): GuideMeStepCompletedResponse;
  guideMeCancel(): GuideMe_CancelResponse;
  guideMePrev(data: GuideMe_PrevData): GuideMe_PrevResponse;
  enterBlurMode(): EnterBlurModeResponse;
  exitBlurMode(): ExitBlurModeResponse;
  processProCommand(data: ProcessProCommandData): ProcessProCommandResponse;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<MimikProtocol>();
