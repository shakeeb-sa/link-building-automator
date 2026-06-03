/**
 * Social media profile URL / handle field detection patterns.
 *
 * Exports a FieldPatternRule for social media, Twitter, Facebook, LinkedIn, Instagram, etc.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'social',
  patterns: [
    /social/i,
    /twitter/i,
    /facebook/i,
    /linkedin/i,
    /instagram/i,
    /social-?media/i,
    /social-?profile/i,
    /x-?handle/i,
  ],
  description: 'Social media profile URL',
};