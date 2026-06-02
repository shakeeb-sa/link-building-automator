/**
 * Context menu feature – double right‑click to paste profile HTML.
 *
 * Orchestrates double‑click detection, data fetching, format menu UI,
 * and pasting into active element.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import { setupDoubleRightClickDetector, destroyDetector } from './detector';
import { getMasterHTML, getSavedFormat } from './fetcher';
import { pasteIntoActiveElement } from './paster';
import { showFormatMenu, removeMenu } from './menu';

let isInitialized = false;

async function onDoubleRightClick(event: MouseEvent): Promise<void> {
  const masterHTML = await getMasterHTML();
  if (!masterHTML) {
    console.warn('[ContextMenu] No master HTML found in active profile');
    return;
  }

  const domain = window.location.hostname;
  const savedFormat = await getSavedFormat(domain);
  const isOverride = event.ctrlKey && event.shiftKey; // Ctrl+Shift+Right‑Click forces menu
  const shouldShowMenu = !savedFormat || isOverride;

  if (shouldShowMenu) {
    showFormatMenu(domain, masterHTML, event.clientX, event.clientY);
  } else {
    const converted = (() => {
      switch (savedFormat) {
        case 'HTML Code (Clean)':
          return masterHTML.replace(/&nbsp;/g, ' ').trim();
        case 'Rich Text':
          return masterHTML;
        default:
          // For other formats, we rely on the menu's convertHTML, but here we need a simple fallback.
          // Since we don't have the converter functions here, we'll just paste the raw HTML.
          // The saved format is not fully handled here because conversion requires the complex logic.
          // We'll keep it simple: if saved format exists but not handled, show menu.
          console.warn(`[ContextMenu] Saved format ${savedFormat} not directly supported, showing menu`);
          showFormatMenu(domain, masterHTML, event.clientX, event.clientY);
          return null;
      }
    })();

    if (converted !== null) {
      await pasteIntoActiveElement(converted, savedFormat === 'Rich Text');
    }
  }
}

export function init(): () => void {
  if (isInitialized) {
    return () => {};
  }
  setupDoubleRightClickDetector(onDoubleRightClick);
  isInitialized = true;

  return () => {
    destroyDetector();
    removeMenu();
    isInitialized = false;
  };
}