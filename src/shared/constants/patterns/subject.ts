/**
 * Email subject / topic field detection patterns.
 *
 * Exports a FieldPatternRule for subject, topic, and subject line inputs.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { FieldPatternRule } from './types';

export const patterns: FieldPatternRule = {
  fieldType: 'subject',
  patterns: [
    /subject/i,
    /topic/i,
    /message_?subject/i,
    /email-?subject/i,
    /subject-?line/i,
  ],
  description: 'Email/forum subject',
};