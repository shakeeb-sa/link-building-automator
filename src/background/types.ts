/**
 * Internal state for the Converter ping‑pong navigation.
 * Stores the original tab ID to return to when the user toggles back.
 */
export interface ConverterState {
  returnTabId: number | null;
}

// All other types are imported from shared/types
export type { ExtensionMessage } from '../shared/types/messages';
export type { IProfile, IProfileData } from '../shared/types/profile';
export type { FormatType, IFormatMemory } from '../shared/types/formatMemory';
export type { IWatchtowerLists, IWatchtowerStatus } from '../shared/types/watchtower';
export type { IUnusedBacklinks, IUnusedBacklinksCategorized } from '../shared/types/unusedBacklinks';