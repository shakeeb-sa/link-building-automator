import { handleError } from '../../../shared/utils/errorHandler';
import type { ExtensionMessage } from '../../../shared/types/messages';
import type { BacklinkBatch } from '../../../shared/types/unusedBacklinks';
import { showModal, hideModal } from './modal';

let floatingButton: HTMLDivElement | null = null;
let currentBatch: BacklinkBatch | null = null;

/**
 * Fetches a fresh batch of backlinks from the background.
 */
async function fetchBatch(): Promise<BacklinkBatch | null> {
  try {
    const message: ExtensionMessage = { type: 'GET_UNUSED_BACKLINKS' };
    const response = await new Promise<{ batch: BacklinkBatch }>((resolve, reject) => {
      chrome.runtime.sendMessage(message, (resp) => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(resp);
      });
    });
    return response.batch;
  } catch (err) {
    handleError('UnusedBacklinks.fetchBatch', err, 'Failed to fetch backlinks');
    return null;
  }
}

/**
 * Shows the modal with the current batch.
 * If no batch exists, fetches one first.
 */
async function showBacklinksModal(): Promise<void> {
  if (!currentBatch) {
    currentBatch = await fetchBatch();
  }
  if (!currentBatch || currentBatch.urls.length === 0) {
    // Show a simple alert (could be improved)
    alert('No backlinks available. Please upload an Excel file in the popup.');
    return;
  }
  showModal(currentBatch, onShuffle, onOpenAll);
}

/**
 * Handles the shuffle action from the modal.
 */
async function onShuffle(): Promise<void> {
  try {
    const message: ExtensionMessage = { type: 'SHUFFLE_BACKLINKS', payload: { sheetNames: undefined } };
    const response = await new Promise<{ batch: BacklinkBatch }>((resolve, reject) => {
      chrome.runtime.sendMessage(message, (resp) => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(resp);
      });
    });
    currentBatch = response.batch;
    // Update modal content (re‑show with new batch)
    showModal(currentBatch, onShuffle, onOpenAll);
  } catch (err) {
    handleError('UnusedBacklinks.onShuffle', err, 'Failed to shuffle backlinks');
  }
}

/**
 * Handles the open‑all action from the modal.
 */
function onOpenAll(): void {
  if (!currentBatch) return;
  for (const url of currentBatch.urls) {
    chrome.tabs.create({ url, active: false });
  }
  // Optionally hide modal after opening
  hideModal();
}

/**
 * Creates the floating button.
 */
function createFloatingButton(): void {
  if (floatingButton) return;

  const btn = document.createElement('div');
  btn.id = 'llb-unused-backlinks-btn';
  btn.className = 'llb-fixed llb-bottom-5 llb-left-5 llb-z-[2147483647] llb-w-9 llb-h-9 llb-bg-purple-600 llb-rounded-full llb-flex llb-items-center llb-justify-center llb-text-white llb-text-xl llb-cursor-pointer llb-shadow-lg llb-transition-transform llb-duration-200 hover:llb-scale-110';
  btn.textContent = '🔗';
  btn.title = 'Unused Backlinks (Alt+S)';
  btn.onclick = () => {
    showBacklinksModal().catch(() => {});
  };
  document.body.appendChild(btn);
  floatingButton = btn;
}

/**
 * Removes the floating button.
 */
function destroyFloatingButton(): void {
  if (floatingButton) {
    floatingButton.remove();
    floatingButton = null;
  }
}

/**
 * Keyboard shortcut handler (Alt+S).
 */
function onKeyDown(e: KeyboardEvent): void {
  if (e.altKey && e.code === 'KeyS') {
    e.preventDefault();
    showBacklinksModal().catch(() => {});
  }
}

/**
 * Initialises the Unused Backlinks feature.
 * @returns cleanup function
 */
export function init(): () => void {
  createFloatingButton();
  document.addEventListener('keydown', onKeyDown);
  return () => {
    destroyFloatingButton();
    document.removeEventListener('keydown', onKeyDown);
    hideModal();
  };
}