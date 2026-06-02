/**
 * Double right‑click detector for context menu feature.
 *
 * Detects two consecutive right‑clicks within 500ms and calls the provided callback.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

type DoubleClickCallback = (event: MouseEvent) => void;

let lastTime = 0;
let timer: number | null = null;
let callback: DoubleClickCallback | null = null;

function onContextMenu(event: MouseEvent): void {
  const now = Date.now();
  const isDouble = (now - lastTime) < 500;
  lastTime = now;

  if (timer) {
    clearTimeout(timer);
    timer = null;
  }

  if (!isDouble) {
    // Single click – wait to see if another follows
    timer = window.setTimeout(() => {
      timer = null;
    }, 500);
    return;
  }

  // Double right‑click detected
  event.preventDefault();
  event.stopPropagation();
  if (callback) {
    callback(event);
  }
}

export function setupDoubleRightClickDetector(fn: DoubleClickCallback): void {
  callback = fn;
  document.addEventListener('contextmenu', onContextMenu);
}

export function destroyDetector(): void {
  document.removeEventListener('contextmenu', onContextMenu);
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  callback = null;
  lastTime = 0;
}