import { blobToDataUrl } from '@/core/export/utils';
import { getGuide } from '@/core/guides/service';

/** One captured step ready for ProcessPro import. */
export type ProcessProExportedStep = {
  id: string;
  index: number;
  description: string;
  action: string;
  url: string;
  /** Full data URL (e.g. `data:image/jpeg;base64,...`) when a screenshot exists. */
  imageDataUrl?: string;
  mimeType?: string;
  width?: number;
  height?: number;
};

/** Serialized guide payload for ProcessPro. */
export type ProcessProExportedGuide = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  stepCount: number;
  steps: ProcessProExportedStep[];
};

/**
 * Loads a guide from IndexedDB and serializes screenshots as data URLs for ProcessPro.
 */
export async function exportGuideForProcessPro(guideId: string): Promise<ProcessProExportedGuide | null> {
  const trimmed = guideId?.trim();
  if (!trimmed) return null;

  const result = await getGuide(trimmed);
  if (!result) return null;

  const { guide, steps, screenshots } = result;
  const exportedSteps: ProcessProExportedStep[] = [];

  for (const step of steps) {
    const exported: ProcessProExportedStep = {
      id: step.id,
      index: step.index,
      description: step.description || '',
      action: step.action || '',
      url: step.url || '',
    };

    const shot = screenshots.get(step.id);
    if (shot?.blob) {
      exported.imageDataUrl = await blobToDataUrl(shot.blob);
      exported.mimeType = shot.mimeType;
      exported.width = shot.width;
      exported.height = shot.height;
    }

    exportedSteps.push(exported);
  }

  return {
    id: guide.id,
    title: guide.title,
    createdAt: guide.createdAt,
    updatedAt: guide.updatedAt,
    stepCount: exportedSteps.length,
    steps: exportedSteps,
  };
}
