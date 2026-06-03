/**
 * Shipping address / section field detection patterns.
 *
 * Exports a FieldPatternRule for shipping, ship to, and shipping address inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'shipping',
  patterns: [
    /shipping/i,
    /ship_?to/i,
    /shipping-?address/i,
  ],
  description: 'Shipping address/section',
};