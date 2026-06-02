/**
 * Profile field mapping utility.
 *
 * Converts dynamic key‑value pairs from a project detail listing
 * into a partial IProfileData object that can be sent to the background
 * to update the active profile.
 *
 * Mapping is case‑insensitive and uses substring matching.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { IProfileData } from '../types/profile';

/**
 * Normalises a string for comparison: lower case, trimmed.
 */
function normalise(str: string): string {
  return str.toLowerCase().trim();
}

/**
 * Checks if a candidate key matches a target pattern.
 * Patterns are arrays of possible substrings.
 */
function matches(key: string, patterns: string[]): boolean {
  const normKey = normalise(key);
  return patterns.some(pattern => normKey.includes(pattern));
}

/**
 * Maps the dynamic fields object and optional project title
 * to a partial IProfileData.
 *
 * @param fields – key‑value pairs from the web app's listing card
 * @param title – the listing's title (project name)
 * @returns A partial profile object; fields that could not be mapped are omitted.
 */
export function mapFieldsToProfileData(
  fields: Record<string, string>,
  title?: string
): Partial<IProfileData> {
  const result: Partial<IProfileData> = {};

  for (const [key, value] of Object.entries(fields)) {
    const trimmedValue = value?.trim() ?? '';
    if (trimmedValue === '') continue;

    // Email
    if (matches(key, ['email', 'e-mail'])) {
      result.email = trimmedValue;
    }
    // Username
    else if (matches(key, ['username', 'user', 'login'])) {
      result.username = trimmedValue;
    }
    // Password (unlikely but supported)
    else if (matches(key, ['password', 'pass', 'pwd'])) {
      result.password = trimmedValue;
    }
    // First name
    else if (matches(key, ['firstname', 'first name', 'fname', 'given name'])) {
      result.firstName = trimmedValue;
    }
    // Last name
    else if (matches(key, ['lastname', 'last name', 'lname', 'surname', 'family name'])) {
      result.lastName = trimmedValue;
    }
    // Company / brand
    else if (matches(key, ['company', 'company name', 'brand', 'organization', 'organisation'])) {
      result.company = trimmedValue;
    }
    // Website / URL
    else if (matches(key, ['website', 'url', 'site', 'homepage'])) {
      result.website = trimmedValue;
    }
    // Job title / position
    else if (matches(key, ['title', 'position', 'job title', 'headline'])) {
      result.title = trimmedValue;
    }
    // Phone / mobile
    else if (matches(key, ['phone', 'mobile', 'tel', 'telephone'])) {
      result.phone = trimmedValue;
    }
    // Address
    else if (matches(key, ['address', 'street', 'addr'])) {
      result.address = trimmedValue;
    }
    // City
    else if (matches(key, ['city', 'town'])) {
      result.city = trimmedValue;
    }
    // State / region
    else if (matches(key, ['state', 'region', 'province', 'county'])) {
      result.region = trimmedValue;
    }
    // ZIP / postal code
    else if (matches(key, ['zip', 'postal', 'postcode', 'pcode'])) {
      result.zip = trimmedValue;
    }
    // Country
    else if (matches(key, ['country'])) {
      result.country = trimmedValue;
    }
    // Category / segment
    else if (matches(key, ['category', 'segment', 'type'])) {
      result.category = trimmedValue;
    }
    // Bio / description → masterHTML (store as plain text, wrap in <p> if needed)
    else if (matches(key, ['bio', 'description', 'about', 'profile'])) {
      // Keep as plain text; the profile form expects HTML, but plain text is safe.
      result.masterHTML = trimmedValue;
    }
    // Any other key is ignored
  }

  // Fallback: if no company field was provided but a title exists, use title as company.
  if (!result.company && title && title.trim() !== '') {
    result.company = title.trim();
  }

  return result;
}