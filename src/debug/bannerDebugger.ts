/**
 * Debugger for watchtower banner CSS issue.
 *
 * Paste the following in the browser console after building and reloading:
 * import('./src/debug/bannerDebugger.js').then(m => m.debugBanner());
 */

export function debugBanner() {
  const banner = document.getElementById('llb-watchtower-banner');
  if (!banner) {
    console.error('❌ Banner not found on the page.');
    return;
  }

  console.log('=== Watchtower Banner Debug ===');
  console.log('1. Banner outerHTML:', banner.outerHTML);
  console.log('2. Inline style attribute:', banner.getAttribute('style'));
  console.log('3. Computed background color:', getComputedStyle(banner).backgroundColor);
  console.log('4. Current applied classes:', banner.className);

  // Force red background
  banner.style.backgroundColor = '#dc2626';
  console.log('5. After forcing: banner.style.backgroundColor =', banner.style.backgroundColor);

  // Check watchtower status via message
  chrome.runtime.sendMessage(
    { type: 'GET_WATCHTOWER_STATUS', payload: { domain: window.location.hostname } },
    (response) => {
      console.log('6. Watchtower status response:', response);
    }
  );
}