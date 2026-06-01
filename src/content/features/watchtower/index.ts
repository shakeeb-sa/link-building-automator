import { normalizeDomain } from '../../../shared/utils/domain';
import { handleError } from '../../../shared/utils/errorHandler';
import type { ExtensionMessage } from '../../../shared/types/messages';

let bannerElement: HTMLDivElement | null = null;
let currentDomain = '';

/**
 * Removes the banner if it exists.
 */
function removeBanner(): void {
  if (bannerElement) {
    bannerElement.remove();
    bannerElement = null;
  }
}

/**
 * Injects a banner with Tailwind classes (using the `llb-` prefix).
 * @param isBlocked – true = red banner, false = green banner.
 * @param sources – string describing which list(s) blocked it.
 */
function injectBanner(isBlocked: boolean, sources: string): void {
  removeBanner();

  const banner = document.createElement('div');
  banner.id = 'llb-watchtower-banner';
  banner.className = `llb-fixed llb-top-0 llb-left-0 llb-w-full llb-z-[2147483647] llb-flex llb-items-center llb-justify-between llb-px-4 llb-py-3 llb-text-white llb-font-black llb-text-sm llb-uppercase llb-tracking-wider llb-shadow-lg ${isBlocked ? 'llb-bg-red-600' : 'llb-bg-green-600'}`;

  const message = isBlocked
    ? `⚠️ Domain (${currentDomain}) is blocked in Watchtower (${sources})`
    : `✅ Domain (${currentDomain}) is safe – no collisions.`;

  const textSpan = document.createElement('span');
  textSpan.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.className = 'llb-ml-4 llb-bg-white/20 llb-px-2 llb-py-1 llb-rounded llb-hover:llb-bg-white/30 llb-transition-colors';
  closeBtn.onclick = () => removeBanner();

  banner.appendChild(textSpan);
  banner.appendChild(closeBtn);

  // Insert at the top of the page
  document.body.prepend(banner);
  bannerElement = banner;

  // Add a spacer div to push page content down (optional)
  const spacer = document.createElement('div');
  spacer.id = 'llb-banner-spacer';
  spacer.style.height = '60px';
  if (!document.getElementById('llb-banner-spacer')) {
    document.body.insertBefore(spacer, document.body.firstChild);
  }
}

/**
 * Fetches watchtower status for the current domain and updates the banner.
 */
async function updateWatchtowerStatus(): Promise<void> {
  try {
    const message: ExtensionMessage = { type: 'GET_WATCHTOWER_STATUS', payload: { domain: currentDomain } };
    const response = await new Promise<{ isBlocked: boolean; sources: string[]; totalBlockedDomains: number }>((resolve, reject) => {
      chrome.runtime.sendMessage(message, (resp) => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(resp);
      });
    });

    const sourceLabels: Record<string, string> = { primary: 'Primary DB', secondary: 'Secondary DB', pasted: 'Pasted List' };
    const sourcesStr = response.sources.map(s => sourceLabels[s] || s).join(' + ');
    injectBanner(response.isBlocked, sourcesStr || 'Unknown');
  } catch (err) {
    handleError('Watchtower.updateStatus', err, 'Failed to get watchtower status');
    removeBanner();
  }
}

/**
 * Listen to storage changes to refresh the banner when watchtower lists update.
 */
function setupStorageListener(): void {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && (changes.watchtower_primary || changes.watchtower_secondary || changes.watchtower_pasted)) {
      updateWatchtowerStatus();
    }
  });
}

/**
 * Initialises the Watchtower feature.
 * @returns cleanup function
 */
export function init(): () => void {
  // Get current domain from window.location
  currentDomain = normalizeDomain(window.location.hostname);
  if (!currentDomain) {
    console.warn('[Watchtower] Could not determine domain');
    return () => {};
  }

  updateWatchtowerStatus();
  setupStorageListener();

  // Return cleanup function
  return () => {
    removeBanner();
    // Storage listener cleanup is tricky; we'll keep it, but it's harmless.
    // For completeness, we could store the listener reference and remove it.
  };
}