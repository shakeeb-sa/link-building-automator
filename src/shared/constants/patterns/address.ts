/**
 * Street address field detection patterns.
 *
 * Exports a FieldPatternRule for address, street, mailing, billing, shipping,
 * and address line inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'address',
  patterns: [
    /address/i,
    /street/i,
    /addr/i,
    /street-?address/i,
    /mailing-?address/i,
    /billing-?address/i,
    /shipping-?address/i,
    /address-?line/i,
    /address-?line-?1/i,
    /address-?line-?2/i,
  ],
  description: 'Street address',
};