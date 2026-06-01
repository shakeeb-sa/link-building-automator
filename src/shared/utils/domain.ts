/**
 * Normalizes a raw domain or URL string to a naked root domain.
 * Examples:
 *   "https://www.example.com/path?query" → "example.com"
 *   "http://sub.domain.co.uk/" → "sub.domain.co.uk"
 *   "www.example.com" → "example.com"
 *   "example.com" → "example.com"
 */
export function normalizeDomain(raw: string): string {
  let cleaned = raw.trim().toLowerCase();

  // Remove protocol
  cleaned = cleaned.replace(/^https?:\/\//, '');

  // Remove 'www.' prefix
  cleaned = cleaned.replace(/^www\./, '');

  // Isolate hostname (stop at first '/', '?', or '#')
  const hostname = cleaned.split(/[/?#]/)[0];

  return hostname;
}

/**
 * Extracts the domain from a full URL (protocol + hostname + path).
 * Returns empty string if URL is invalid.
 */
export function extractDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    let hostname = urlObj.hostname.toLowerCase();
    // Remove leading 'www.' if present
    if (hostname.startsWith('www.')) {
      hostname = hostname.slice(4);
    }
    return hostname;
  } catch {
    return '';
  }
}

/**
 * Checks if a string is a valid HTTP/HTTPS URL.
 */
export function isValidUrl(url: string): boolean {
  try {
    const trimmed = url.trim();
    if (!trimmed.startsWith('http')) {
      return false;
    }
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the normalized domain of the current page (for content scripts).
 * Returns empty string if not in a browser context or URL is invalid.
 */
export function getCurrentDomain(): string {
  if (typeof window === 'undefined' || !window.location) {
    return '';
  }
  return normalizeDomain(window.location.hostname);
}