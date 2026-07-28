/**
 * @vitest-environment happy-dom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { installProcessProDomMarker, removeProcessProDomMarker } from '../dom-marker';
import { DOM_MARKER_ELEMENT_ID, DOM_VERSION_ATTRIBUTE } from '../protocol';

describe('ProcessPro DOM marker', () => {
  afterEach(() => {
    removeProcessProDomMarker();
    document.body.innerHTML = '';
  });

  it('creates html attribute and hidden marker with correct version', () => {
    installProcessProDomMarker();

    expect(document.documentElement.getAttribute(DOM_VERSION_ATTRIBUTE)).toBe('1.0.0');
    const marker = document.getElementById(DOM_MARKER_ELEMENT_ID);
    expect(marker).not.toBeNull();
    expect(marker?.getAttribute('data-installed')).toBe('true');
    expect(marker?.getAttribute('data-version')).toBe('1.0.0');
    expect(marker?.hasAttribute('hidden')).toBe(true);
  });

  it('does not create a duplicate marker element', () => {
    installProcessProDomMarker();
    installProcessProDomMarker();

    expect(document.querySelectorAll(`#${DOM_MARKER_ELEMENT_ID}`).length).toBe(1);
    expect(document.documentElement.getAttribute(DOM_VERSION_ATTRIBUTE)).toBe('1.0.0');
  });

  it('removes marker and attributes on cleanup', () => {
    installProcessProDomMarker();
    removeProcessProDomMarker();

    expect(document.getElementById(DOM_MARKER_ELEMENT_ID)).toBeNull();
    expect(document.documentElement.getAttribute(DOM_VERSION_ATTRIBUTE)).toBeNull();
  });
});
