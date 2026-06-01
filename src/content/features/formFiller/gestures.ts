type QuadClickCallback = (event: MouseEvent) => void;
type LongPressCallback = () => void;

let clickTimer: number | null = null;
let clickCount = 0;
let lastClickEvent: MouseEvent | null = null;

let longPressTimer: number | null = null;
let isLongPressTriggered = false;

let quadClickCallback: QuadClickCallback | null = null;
let longPressCallback: LongPressCallback | null = null;

// Time windows (in milliseconds)
const CLICK_TIMEOUT = 600;      // Reset click count after 600ms of inactivity
const LONG_PRESS_DURATION = 2000; // 2 seconds

// Helper to reset click state
function resetClickState(): void {
  if (clickTimer) clearTimeout(clickTimer);
  clickTimer = null;
  clickCount = 0;
  lastClickEvent = null;
}

// Helper to start click timer
function startClickTimer(): void {
  if (clickTimer) clearTimeout(clickTimer);
  clickTimer = window.setTimeout(() => {
    resetClickState();
  }, CLICK_TIMEOUT);
}

// Global click handler
function onDocumentClick(event: MouseEvent): void {
  // Ignore if any callback is not set
  if (!quadClickCallback) return;

  // Increment click count
  clickCount++;
  lastClickEvent = event;

  // Start/refresh the timer
  startClickTimer();

  // When we reach 4 clicks, trigger the quad-click callback
  if (clickCount === 4) {
    quadClickCallback(event);
    resetClickState(); // Immediately reset to prevent accidental extra triggers
  }
}

// Global mouse down handler (for long press)
function onDocumentMouseDown(event: MouseEvent): void {
  if (!longPressCallback) return;
  // Only consider left button (button === 0)
  if (event.button !== 0) return;

  isLongPressTriggered = false;
  longPressTimer = window.setTimeout(() => {
    // Double-check that the callback still exists (it may have been cleared)
    if (longPressCallback) {
      isLongPressTriggered = true;
      longPressCallback();
    }
  }, LONG_PRESS_DURATION);
}

// Global mouse up handler (cancel long press if released early)
function onDocumentMouseUp(event: MouseEvent): void {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

// Handle window blur (cancel long press if tab loses focus)
function onWindowBlur(): void {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

/**
 * Sets up global event listeners for click counting and long press.
 * @param onQuadClick – called when 4 clicks occur within the timeout window.
 * @param onLongPress – called when mouse is held down for LONG_PRESS_DURATION.
 */
export function setupClickCounter(onQuadClick: QuadClickCallback, onLongPress: LongPressCallback): void {
  quadClickCallback = onQuadClick;
  longPressCallback = onLongPress;

  document.addEventListener('click', onDocumentClick);
  document.addEventListener('mousedown', onDocumentMouseDown);
  document.addEventListener('mouseup', onDocumentMouseUp);
  window.addEventListener('blur', onWindowBlur);
}

/**
 * Removes all gesture event listeners and resets state.
 */
export function destroyClickCounter(): void {
  document.removeEventListener('click', onDocumentClick);
  document.removeEventListener('mousedown', onDocumentMouseDown);
  document.removeEventListener('mouseup', onDocumentMouseUp);
  window.removeEventListener('blur', onWindowBlur);

  if (clickTimer) clearTimeout(clickTimer);
  if (longPressTimer) clearTimeout(longPressTimer);
  clickTimer = null;
  longPressTimer = null;
  clickCount = 0;
  lastClickEvent = null;
  isLongPressTriggered = false;
  quadClickCallback = null;
  longPressCallback = null;
}

/**
 * Returns the current click count (for debugging, not typically needed).
 */
export function getClickCount(): number {
  return clickCount;
}

/**
 * Returns the last click event (if any).
 */
export function getLastClickEvent(): MouseEvent | null {
  return lastClickEvent;
}

/**
 * Resets the click counter programmatically (useful after quad‑click).
 */
export function resetClickCounter(): void {
  resetClickState();
}