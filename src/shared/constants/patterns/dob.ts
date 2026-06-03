/**
 * Date of birth / birthday field detection patterns.
 *
 * Exports a FieldPatternRule for birth date, DOB, date of birth, and birthday inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'dob',
  patterns: [
    /birth/i,
    /dob/i,
    /date_?of_?birth/i,
    /birthday/i,
  ],
  description: 'Date of birth',
};