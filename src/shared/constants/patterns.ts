/**
 * Field detection patterns and utilities for form filling.
 *
 * This file re‑exports types, patterns, and the detection function
 * from the modular patterns folder. It serves as a facade to maintain
 * backward compatibility with existing imports.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

// Re‑export FIELD_PATTERNS (value) from the modular patterns folder
export { FIELD_PATTERNS } from './patterns/index';

// Re‑export FieldPatternRule (type) from the modular patterns folder
export type { FieldPatternRule } from './patterns/index';

// Re‑export detectFieldType from fieldDetector for backward compatibility
export { detectFieldType } from './fieldDetector';

// Re‑export FieldType from fieldTypes for backward compatibility
export type { FieldType } from './fieldTypes';