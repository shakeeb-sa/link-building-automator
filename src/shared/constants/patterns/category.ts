/**
 * Category / section / classified field detection patterns.
 *
 * Exports a FieldPatternRule for category, section, post type, and classified inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'category',
  patterns: [
    /category/i,
    /cat_?id/i,
    /section/i,
    /type_of_post/i,
    /classified/i,
    /segment/i,
  ],
  description: 'Category dropdown/input',
};