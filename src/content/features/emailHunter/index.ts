import { handleError } from '../../../shared/utils/errorHandler';

// List of supported fake‑email domains
const FAKE_EMAIL_DOMAINS = [
  'fakemail.net',
  'temp-mail.org',
  '10minutemail.com',
  'emailondeck.com',
  'yopmail.com',
  'tempmail.plus',
  'aicrowd.com',
];

let scanInterval: number | null = null;
let hudElement: HTMLDivElement | null = null;

/**
 * Checks if the current page is a fake‑email service.
 */
function isFakeEmailDomain(): boolean {
  const hostname = window.location.hostname.toLowerCase();
  return FAKE_EMAIL_DOMAINS.some(domain => hostname.includes(domain));
}

/**
 * Removes the HUD if it exists.
 */
function removeHUD(): void {
  if (hudElement) {
    hudElement.remove();
    hudElement = null;
  }
}

/**
 * Creates and shows a temporary HUD with a message.
 * @param message – text to display
 * @param isLink – if true, the message is a clickable link
 * @param url – optional URL for the link
 */
function showHUD(message: string, isLink: boolean = false, url: string = ''): void {
  removeHUD();

  const hud = document.createElement('div');
  hud.id = 'llb-email-hunter-hud';
  hud.className = 'llb-fixed llb-top-4 llb-right-4 llb-z-[2147483647] llb-bg-navy-800 llb-text-white llb-p-3 llb-rounded-lg llb-shadow-xl llb-flex llb-items-center llb-gap-3 llb-animate-in llb-slide-in-from-right llb-duration-300';

  const content = document.createElement('div');
  content.className = 'llb-text-xs llb-font-medium';

  if (isLink && url) {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = message;
    link.className = 'llb-text-peach-500 llb-underline llb-hover:llb-text-peach-400';
    content.appendChild(link);
  } else {
    content.textContent = message;
  }

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.className = 'llb-text-white/60 llb-hover:text-white llb-text-sm llb-leading-4';
  closeBtn.onclick = removeHUD;

  hud.appendChild(content);
  hud.appendChild(closeBtn);
  document.body.appendChild(hud);
  hudElement = hud;

  // Auto‑remove after 8 seconds
  setTimeout(() => {
    if (hudElement === hud) removeHUD();
  }, 8000);
}

/**
 * Scans the page for verification links or OTP codes.
 */
function scan(): void {
  // 1. Look for <a> tags with verification keywords
  const links = document.querySelectorAll<HTMLAnchorElement>('a');
  const keywords = ['confirm', 'verify', 'activate', 'click here', 'login details', 'set your password'];
  let foundLink: HTMLAnchorElement | null = null;
  let foundUrl = '';

  for (const link of links) {
    const text = (link.innerText || '').toLowerCase();
    const href = (link.href || '').toLowerCase();
    if (href.includes('unsubscribe')) continue;
    const textMatch = keywords.some(kw => text.includes(kw));
    const urlMatch = /key=|token=|code=|confirm|\/verify\//.test(href);
    if (textMatch || urlMatch) {
      foundLink = link;
      foundUrl = link.href;
      break;
    }
  }

  if (foundLink && foundUrl) {
    // Highlight the link
    foundLink.style.border = '3px solid #00b894';
    foundLink.style.boxShadow = '0 0 8px #00b894';
    showHUD('🚀 Verification link detected', true, foundUrl);
    return;
  }

  // 2. Look for OTP codes in text
  const bodyText = document.body.innerText;
  const otpRegex = /\b(?!(?:19|20)\d{2})(?<!\d)(\d{4,8})(?!\d)\b/g;
  const matches = bodyText.match(otpRegex);
  if (matches && matches.length > 0) {
    const otp = matches.find(m => m !== '8080' && m !== '3000') || matches[0];
    navigator.clipboard.writeText(otp).catch(() => {});
    showHUD(`📋 OTP code copied: ${otp}`, false);
  }
}

/**
 * Starts the periodic scanner (every 1.5 seconds).
 */
function startScanner(): void {
  if (scanInterval) clearInterval(scanInterval);
  scan(); // immediate scan
  scanInterval = window.setInterval(scan, 1500);
}

/**
 * Stops the scanner and removes HUD.
 */
function stopScanner(): void {
  if (scanInterval) {
    clearInterval(scanInterval);
    scanInterval = null;
  }
  removeHUD();
}

/**
 * Initialises the Email Hunter feature.
 * @returns cleanup function
 */
export function init(): () => void {
  if (!isFakeEmailDomain()) {
    return () => {}; // not a fake‑email site, do nothing
  }
  startScanner();
  return () => {
    stopScanner();
  };
}