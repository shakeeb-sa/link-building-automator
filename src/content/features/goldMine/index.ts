import { handleError } from '../../../shared/utils/errorHandler';
import type { ExtensionMessage } from '../../../shared/types/messages';
import type { FormatType } from '../../../shared/types/formatMemory';
import { showModal, hideModal } from './modal';

let buttonElement: HTMLDivElement | null = null;
let isEnabled = false;

/**
 * Fetches a batch of shuffled domains from the background.
 * @returns array of domain strings (or empty array on error)
 */
async function fetchGoldMineBatch(): Promise<{ domains: string[]; formats: FormatType[] }> {
  try {
    const message: ExtensionMessage = { type: 'GOLD_MINE_SHUFFLE' };
    const response = await new Promise<{ batch: { urls: string[]; formats: FormatType[] } }>((resolve, reject) => {
      chrome.runtime.sendMessage(message, (resp) => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(resp);
      });
    });
    return { domains: response.batch.urls, formats: response.batch.formats };
  } catch (err) {
    handleError('GoldMine.fetchBatch', err, 'Failed to fetch gold mine batch');
    return { domains: [], formats: [] };
  }
}

/**
 * Shows the gold mine modal with the fetched batch.
 */
async function showGoldMineModal(): Promise<void> {
  const { domains, formats } = await fetchGoldMineBatch();
  if (domains.length === 0) {
    alert('No domains available. Save some formats first.');
    return;
  }
  showModal(domains, formats);
}

/**
 * Creates the floating gold button (if not already present).
 */
function createButton(): void {
  if (buttonElement) return;

  const btn = document.createElement('div');
  btn.id = 'llb-gold-mine-btn';
  btn.className = 'llb-fixed llb-bottom-20 llb-left-5 llb-z-[2147483647] llb-w-9 llb-h-9 llb-bg-yellow-500 llb-rounded-full llb-flex llb-items-center llb-justify-center llb-text-white llb-text-xl llb-cursor-pointer llb-shadow-lg llb-transition-transform llb-duration-200 hover:llb-scale-110';
  btn.textContent = '🏆';
  btn.title = 'Gold Mine – Shuffle Saved Formats';
  btn.onclick = () => {
    showGoldMineModal().catch(() => {});
  };
  document.body.appendChild(btn);
  buttonElement = btn;
}

/**
 * Removes the floating gold button.
 */
function destroyButton(): void {
  if (buttonElement) {
    buttonElement.remove();
    buttonElement = null;
  }
}

/**
 * Listens for toggle messages from the popup.
 */
function setupMessageListener(): void {
  chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
    if (message.type === 'TOGGLE_GOLD_MINE') {
      isEnabled = message.payload.enabled;
      if (isEnabled) {
        createButton();
      } else {
        destroyButton();
        hideModal();
      }
      sendResponse({ success: true });
      return false;
    }
    return false;
  });
}

/**
 * Reads the initial gold mine state from storage.
 */
async function loadInitialState(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['goldMineEnabled'], (result) => {
      isEnabled = result.goldMineEnabled === true;
      resolve();
    });
  });
}

/**
 * Initialises the Gold Mine feature.
 * @returns cleanup function
 */
export async function init(): Promise<() => void> {
  await loadInitialState();
  setupMessageListener();
  if (isEnabled) {
    createButton();
  }
  return () => {
    destroyButton();
    hideModal();
  };
}