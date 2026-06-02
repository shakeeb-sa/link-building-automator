let currentBanner: HTMLDivElement | null = null;
let currentSpacer: HTMLDivElement | null = null;

/**
 * Removes the current banner and spacer if they exist.
 */
export function removeBanner(): void {
  if (currentBanner) {
    currentBanner.remove();
    currentBanner = null;
  }
  if (currentSpacer) {
    currentSpacer.remove();
    currentSpacer = null;
  }
}

/**
 * Injects a watchtower banner at the top of the page.
 * @param domain – the normalised domain name (shown in the message)
 * @param isBlocked – true for red (blocked), false for green (safe)
 * @param sources – array of source strings (e.g., ['Primary DB', 'Pasted List'])
 */
export function injectBanner(domain: string, isBlocked: boolean, sources: string[]): void {
  // Remove any existing banner first
  removeBanner();

  const sourceText = sources.length > 0 ? ` (${sources.join(' + ')})` : '';
  const message = isBlocked
    ? `⚠️ Domain "${domain}" is blocked in Watchtower${sourceText}`
    : `✅ Domain "${domain}" is safe – no collisions.`;

  // Create banner container
  const banner = document.createElement('div');
  banner.id = 'llb-watchtower-banner';
  // Keep all layout classes, but set background color directly via inline style
  banner.className = `llb-fixed llb-top-0 llb-left-0 llb-w-full llb-z-[2147483647] llb-flex llb-items-center llb-justify-between llb-px-4 llb-py-3 llb-text-white llb-font-black llb-text-sm llb-uppercase llb-tracking-wider llb-shadow-lg`;
  banner.style.backgroundColor = isBlocked ? '#dc2626' : '#10b981'; // red-600 / green-600

  // Message text
  const textSpan = document.createElement('span');
  textSpan.textContent = message;
  textSpan.className = 'llb-flex-1';

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.className = 'llb-ml-4 llb-bg-white/20 llb-px-2 llb-py-1 llb-rounded llb-hover:llb-bg-white/30 llb-transition-colors llb-cursor-pointer';
  closeBtn.onclick = removeBanner;

  banner.appendChild(textSpan);
  banner.appendChild(closeBtn);

  // Create spacer to push page content down (60px height)
  const spacer = document.createElement('div');
  spacer.id = 'llb-banner-spacer';
  spacer.style.height = '60px';
  spacer.style.width = '100%';

  // Insert banner and spacer at the beginning of the body
  document.body.prepend(spacer);
  document.body.prepend(banner);

  currentBanner = banner;
  currentSpacer = spacer;
}