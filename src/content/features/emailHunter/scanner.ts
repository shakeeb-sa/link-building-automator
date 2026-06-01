/**
 * Scans the page for a verification link.
 * Looks for <a> tags whose text or href contains common verification keywords.
 * @returns the URL of the first matching link, or null if none found.
 */
export function findVerificationLink(): string | null {
  const links = document.querySelectorAll<HTMLAnchorElement>('a');
  const keywords = ['confirm', 'verify', 'activate', 'click here', 'login details', 'set your password'];

  for (const link of links) {
    const text = (link.innerText || '').toLowerCase();
    const href = (link.href || '').toLowerCase();

    // Skip unsubscribe links
    if (href.includes('unsubscribe')) continue;

    const textMatch = keywords.some(kw => text.includes(kw));
    const urlMatch = /key=|token=|code=|confirm|\/verify\//.test(href);

    if (textMatch || urlMatch) {
      return link.href;
    }
  }
  return null;
}

/**
 * Scans the page for an OTP (one‑time password) code.
 * Looks for a 4‑8 digit number that is not a year (1900‑2099) and not a common port (3000, 8080).
 * @returns the OTP code as a string, or null if none found.
 */
export function findOtpCode(): string | null {
  const bodyText = document.body.innerText;
  // Match 4‑8 digits that are not preceded/followed by another digit
  const otpRegex = /\b(?!(?:19|20)\d{2})(?<!\d)(\d{4,8})(?!\d)\b/g;
  const matches = bodyText.match(otpRegex);
  if (!matches) return null;

  // Filter out common false positives
  const filtered = matches.filter(code => code !== '8080' && code !== '3000');
  return filtered.length > 0 ? filtered[0] : null;
}