/**
 * ZIP / postal code field detection patterns.
 *
 * Exports a FieldPatternRule for postal code, ZIP code, postcode, and related inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'zip',
  patterns: [
    /zip/i,
    /postal/i,
    /pcode/i,
    /postcode/i,
    /postal-?code/i,
    /post-?code/i,
    /zip-?code/i,
    /zip\+4/i,
    /zip-four/i,
    /p\.c\./i,
    /zipcode/i,
  ],
  description: 'ZIP/postal code',
};