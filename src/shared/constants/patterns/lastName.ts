/**
 * Last name / surname field detection patterns.
 *
 * Exports a FieldPatternRule for last/family name inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'lastName',
  patterns: [
    /last_?name/i,
    /lname/i,
    /surname/i,
    /family_?name/i,
    /family-?name/i,
    /last/i,
    /name-?last/i,
  ],
  description: 'Last name',
};