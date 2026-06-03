/**
 * City / town field detection patterns.
 *
 * Exports a FieldPatternRule for city, town, suburb, locality, and municipality inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'city',
  patterns: [
    /city/i,
    /town/i,
    /city\/town/i,
    /suburb/i,
    /locality/i,
    /municipality/i,
  ],
  description: 'City/town',
};