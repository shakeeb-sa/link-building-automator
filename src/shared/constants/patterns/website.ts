/**
 * Website / URL field detection patterns.
 *
 * Exports a FieldPatternRule for website, URL, homepage, and web address inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'website',
  patterns: [
    /website/i,
    /site/i,
    /url/i,
    /homepage/i,
    /web_?address/i,
    /web-?address/i,
    /website-?url/i,
  ],
  description: 'Website URL',
};