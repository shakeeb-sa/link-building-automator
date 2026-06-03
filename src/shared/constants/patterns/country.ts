/**
 * Country field detection patterns.
 *
 * Exports a FieldPatternRule for country, nation, and country code inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'country',
  patterns: [
    /country/i,
    /nation/i,
    /country\/region/i,
    /select-?country/i,
    /country-?code/i,
  ],
  description: 'Country',
};