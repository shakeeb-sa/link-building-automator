/**
 * Price / budget / cost field detection patterns.
 *
 * Exports a FieldPatternRule for price, budget, cost, and amount inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'price',
  patterns: [
    /price/i,
    /budget/i,
    /cost/i,
    /amount/i,
    /price-?range/i,
  ],
  description: 'Price/budget field',
};