import { DOM_MARKER_ELEMENT_ID, DOM_VERSION_ATTRIBUTE } from './protocol';
import { getExtensionVersion } from './version';

/**
 * Installs a non-visual ProcessPro detection marker on authorised pages.
 * Primary signal: `data-processpro-recorder-version` on `<html>` (ProcessPro reads this).
 * Also maintains a hidden `#processpro-recorder-extension` element with the same version.
 */
export function installProcessProDomMarker(): void {
  const version = getExtensionVersion();

  document.documentElement.setAttribute(DOM_VERSION_ATTRIBUTE, version);
  if (document.body) {
    document.body.setAttribute(DOM_VERSION_ATTRIBUTE, version);
  }

  const existing = document.getElementById(DOM_MARKER_ELEMENT_ID);
  if (existing) {
    existing.setAttribute('data-installed', 'true');
    existing.setAttribute('data-version', version);
    existing.setAttribute('hidden', '');
    existing.setAttribute('aria-hidden', 'true');
    return;
  }

  const marker = document.createElement('div');
  marker.id = DOM_MARKER_ELEMENT_ID;
  marker.setAttribute('data-installed', 'true');
  marker.setAttribute('data-version', version);
  marker.setAttribute('hidden', '');
  marker.setAttribute('aria-hidden', 'true');
  marker.style.cssText =
    'display:none!important;visibility:hidden!important;position:absolute!important;width:0!important;height:0!important;overflow:hidden!important;pointer-events:none!important;';

  const parent = document.documentElement;
  parent.appendChild(marker);
}

/**
 * Removes ProcessPro detection markers from the page (HMR / cleanup).
 */
export function removeProcessProDomMarker(): void {
  document.documentElement.removeAttribute(DOM_VERSION_ATTRIBUTE);
  if (document.body) {
    document.body.removeAttribute(DOM_VERSION_ATTRIBUTE);
  }
  document.getElementById(DOM_MARKER_ELEMENT_ID)?.remove();
}
