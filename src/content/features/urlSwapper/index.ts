import { handleError } from '../../../shared/utils/errorHandler';
import type { ExtensionMessage } from '../../../shared/types/messages';
import { normalizeDomain } from '../../../shared/utils/domain';

let buttonElement: HTMLDivElement | null = null;

/**
 * Fetches the active profile's username.
 * @returns username string (or empty string on error)
 */
async function fetchMyUsername(): Promise<string> {
  try {
    const message: ExtensionMessage = { type: 'GET_PROFILE_DATA' };
    const response = await new Promise<{ data: { username: string } | null }>((resolve, reject) => {
      chrome.runtime.sendMessage(message, (resp) => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(resp);
      });
    });
    return response.data?.username || '';
  } catch (err) {
    handleError('UrlSwapper.fetchMyUsername', err, 'Failed to fetch username');
    return '';
  }
}

/**
 * Extracts a suspect username from the current URL path.
 * @returns object { username: string, index: number, mode: 'prefix' | 'at' | 'root' } or null
 */
function detectSuspectUsername(): { username: string; index: number; mode: string } | null {
  const path = window.location.pathname;
  const segments = path.split('/').filter(s => s.length > 0);
  if (segments.length === 0) return null;

  // Prefix modes: /user/name, /u/name, /profile/name, etc.
  const prefixList = ['user', 'users', 'u', 'profile', 'profiles', 'p', 'member', 'members', 'author', 'account', 'channel', 'c', 'id'];
  if (segments.length >= 2) {
    const secondLast = segments[segments.length - 2].toLowerCase();
    if (prefixList.includes(secondLast)) {
      const username = segments[segments.length - 1];
      return { username, index: segments.length - 1, mode: 'prefix' };
    }
  }

  // @mention style: /@username
  const last = segments[segments.length - 1];
  if (last.startsWith('@')) {
    const username = last.slice(1);
    return { username, index: segments.length - 1, mode: 'at' };
  }

  // Root level: /username  (but skip common non‑username words)
  if (segments.length === 1) {
    const potential = segments[0];
    const ignoreList = [
      'about', 'contact', 'terms', 'privacy', 'help', 'support', 'login', 'signin', 'signup',
      'register', 'search', 'explore', 'home', 'index', 'category', 'shop', 'cart', 'checkout',
      'blog', 'news', 'articles', 'features', 'pricing', 'plans', 'api', 'dev', 'jobs', 'careers',
      'sitemap', 'robots', 'admin', 'wp-admin', 'dashboard', 'my-account', 'account', 'profile'
    ];
    if (!ignoreList.includes(potential.toLowerCase()) && potential.length < 40) {
      return { username: potential, index: 0, mode: 'root' };
    }
  }

  return null;
}

/**
 * Creates the floating swap button.
 * @param targetUsername – the username to swap to
 * @param targetUrl – the full URL to navigate to
 */
function createSwapButton(targetUsername: string, targetUrl: string): void {
  if (buttonElement) return;

  const btn = document.createElement('div');
  btn.id = 'llb-url-swapper-btn';
  btn.className = 'llb-fixed llb-bottom-20 llb-right-5 llb-z-[2147483647] llb-bg-navy-800 llb-text-white llb-p-2 llb-rounded-lg llb-shadow-xl llb-cursor-pointer llb-flex llb-items-center llb-gap-2 llb-transition-all llb-duration-200 hover:llb-scale-105';
  btn.innerHTML = `
    <span class="llb-text-sm">⚡</span>
    <span class="llb-text-xs llb-font-black llb-uppercase">Go to /${targetUsername}?</span>
    <span class="llb-text-white/60 llb-text-lg llb-leading-4" id="llb-swapper-close">&times;</span>
  `;

  // Navigate on click (except the close button)
  btn.onclick = (e) => {
    const target = e.target as HTMLElement;
    if (target.id === 'llb-swapper-close') {
      btn.remove();
      buttonElement = null;
    } else {
      window.location.href = targetUrl;
    }
  };

  document.body.appendChild(btn);
  buttonElement = btn;
}

/**
 * Removes the swap button if present.
 */
function destroySwapButton(): void {
  if (buttonElement) {
    buttonElement.remove();
    buttonElement = null;
  }
}

/**
 * Initialises the URL Swapper feature.
 * @returns cleanup function
 */
export async function init(): Promise<() => void> {
  const myUsername = await fetchMyUsername();
  if (!myUsername) {
    return () => {}; // no username, cannot suggest swap
  }

  const suspect = detectSuspectUsername();
  if (!suspect) return () => {};

  const cleanSuspect = suspect.mode === 'at' ? suspect.username.slice(1) : suspect.username;
  const cleanMy = myUsername.startsWith('@') ? myUsername.slice(1) : myUsername;
  if (cleanSuspect.toLowerCase() === cleanMy.toLowerCase()) {
    return () => {}; // already on own profile
  }

  // Build target URL
  const segments = window.location.pathname.split('/').filter(s => s.length > 0);
  const newUsername = suspect.mode === 'at' ? `@${cleanMy}` : cleanMy;
  segments[suspect.index] = newUsername;
  const newPath = '/' + segments.join('/');
  const targetUrl = window.location.origin + newPath + window.location.search;

  createSwapButton(cleanMy, targetUrl);

  return () => {
    destroySwapButton();
  };
}