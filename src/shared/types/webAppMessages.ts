/**
 * Types and type guard for postMessage events from the web app.
 *
 * The web app sends a message when a user clicks "Use for AutoFill"
 * on a project detail card. This file defines the expected structure
 * and provides a safe validation function.
 *
 * No `any` or unsafe type assertions are used.
 */

/**
 * Expected structure of the postMessage data from the web app.
 */
export interface ProjectDataMessage {
  type: 'LINKFLOW_SET_PROJECT_DATA';
  payload: {
    /** The title of the project listing (e.g., company name). */
    title: string;
    /** Dynamic key‑value fields from the listing card. */
    fields: Record<string, string>;
    /** Optional URL to the listing's logo image. */
    logoUrl?: string;
  };
}

/**
 * Type guard to safely validate an unknown value as a ProjectDataMessage.
 *
 * @param data – The raw data from MessageEvent.data (type unknown).
 * @returns True if the data matches the ProjectDataMessage shape.
 *
 * Why `unknown`? The DOM API types MessageEvent.data as `unknown`
 * because it can come from any origin. Using `unknown` forces us to
 * perform exhaustive runtime checks before treating the value as a
 * specific type, eliminating the need for `any` or unsafe assertions.
 */
export function isProjectDataMessage(data: unknown): data is ProjectDataMessage {
  // 1. Must be a non‑null object
  if (data === null || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  // 2. Check type property
  if (obj.type !== 'LINKFLOW_SET_PROJECT_DATA') return false;

  // 3. Check payload exists and is an object
  const payload = obj.payload;
  if (payload === null || typeof payload !== 'object') return false;

  const p = payload as Record<string, unknown>;

  // 4. Validate required fields: title (string)
  if (typeof p.title !== 'string') return false;

  // 5. Validate required fields: fields (object, not null)
  if (typeof p.fields !== 'object' || p.fields === null) return false;

  // 6. Validate optional logoUrl (if present, must be string)
  if (p.logoUrl !== undefined && typeof p.logoUrl !== 'string') return false;

  // All checks passed
  return true;
}