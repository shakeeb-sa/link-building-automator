/**
 * Full name / display name field detection patterns.
 *
 * Exports a FieldPatternRule for full name, display name, and complete name inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'fullName',
  patterns: [
    /full_?name/i,
    /fullname/i,
    /display_?name/i,
    /display-?name/i,
    /complete_?name/i,
    /complete-?name/i,
    /your-?name/i,
    /real-?name/i,
  ],
  description: 'Full name',
};