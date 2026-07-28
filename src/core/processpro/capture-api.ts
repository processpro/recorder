import { getActiveTab, openSidebar } from '@/lib/browser-api';
import { sendMessage } from '@/lib/messaging';

export type ProcessProCaptureState = {
  state: string;
  stepCount: number;
  currentGuideId: string | null;
};

export type ProcessProCaptureApi = {
  getState: () => Promise<ProcessProCaptureState>;
  startRecording: (url: string) => Promise<{ guideId: string }>;
  stopRecording: () => Promise<{ success: boolean; guideId?: string }>;
  openSidebar: () => void;
  resolveDefaultUrl: () => Promise<string>;
};

let registeredApi: ProcessProCaptureApi | null = null;

/**
 * Background registers a direct capture API so ProcessPro commands do not nest
 * `runtime.sendMessage` inside the service worker (unreliable in MV3).
 */
export function registerProcessProCaptureApi(api: ProcessProCaptureApi): void {
  registeredApi = api;
}

export function getProcessProCaptureApi(): ProcessProCaptureApi {
  if (registeredApi) return registeredApi;

  // Fallback for unit tests / contexts without a background registration.
  return {
    getState: () => sendMessage('getState'),
    startRecording: (url) => sendMessage('startRecording', { url }),
    stopRecording: () => sendMessage('stopRecording'),
    openSidebar: () => {
      try {
        openSidebar();
      } catch {
        // Side panel may be unavailable.
      }
    },
    resolveDefaultUrl: async () => {
      const tab = await getActiveTab();
      return tab?.url || 'about:blank';
    },
  };
}
