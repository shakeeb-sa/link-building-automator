/**
 * Central messaging types entry point.
 *
 * Re‑exports all message types from domain modules and composes the
 * `ExtensionMessage` discriminated union for runtime message handling.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

// Re‑export base types
export type { BaseMessage, MessageType } from './base';

// Re‑export all domain message types and their responses
export type * from './profile';
export type * from './watchtower';
export type * from './formatMemory';
export type * from './unusedBacklinks';
export type * from './navigation';
export type * from './toggle';
export type * from './ui';

// Import concrete message types for the union (using `import type` to avoid bundling)
import type { GetActiveProfileMessage } from './profile';
import type { GetProfileDataMessage } from './profile';
import type { SetActiveProfileMessage } from './profile';
import type { UpdateProfileDataMessage } from './profile';
import type { GetAllProfilesMessage } from './profile';
import type { CreateProfileMessage } from './profile';
import type { UpdateProfileMessage } from './profile';
import type { DeleteProfileMessage } from './profile';
import type { GetWatchtowerStatusMessage } from './watchtower';
import type { GetWatchtowerListsMessage } from './watchtower';
import type { UpdateWatchtowerListsMessage } from './watchtower';
import type { AddPrimaryDomainsMessage } from './watchtower';
import type { AddSecondaryDomainsMessage } from './watchtower';
import type { SetPastedDomainsMessage } from './watchtower';
import type { ClearPrimaryDomainsMessage } from './watchtower';
import type { ClearSecondaryDomainsMessage } from './watchtower';
import type { ClearPastedDomainsMessage } from './watchtower';
import type { GetFormatMemoryMessage } from './formatMemory';
import type { SetFormatMemoryMessage } from './formatMemory';
import type { GetAllFormatsMessage } from './formatMemory';
import type { DeleteFormatMessage } from './formatMemory';
import type { ClearAllFormatsMessage } from './formatMemory';
import type { GetUnusedBacklinksMessage } from './unusedBacklinks';
import type { ShuffleBacklinksMessage } from './unusedBacklinks';
import type { OpenGatewayMenuMessage } from './navigation';
import type { ActivateFakeMailMessage } from './navigation';
import type { ActivateConverterMessage } from './navigation';
import type { MasterSwitchToggleMessage } from './toggle';
import type { GoldMineShuffleMessage } from './toggle';
import type { ToggleGoldMineMessage } from './toggle';
import type { QuadFillMessage } from './toggle';        // <-- added
import type { ShowToastMessage } from './ui';
import type { ContextMenuPasteMessage } from './ui';

// ----------------------------------------------------------------------------
// Discriminated union of all possible extension messages
// ----------------------------------------------------------------------------
export type ExtensionMessage =
  | GetActiveProfileMessage
  | GetProfileDataMessage
  | SetActiveProfileMessage
  | UpdateProfileDataMessage
  | GetAllProfilesMessage
  | CreateProfileMessage
  | UpdateProfileMessage
  | DeleteProfileMessage
  | GetWatchtowerStatusMessage
  | GetWatchtowerListsMessage
  | UpdateWatchtowerListsMessage
  | AddPrimaryDomainsMessage
  | AddSecondaryDomainsMessage
  | SetPastedDomainsMessage
  | ClearPrimaryDomainsMessage
  | ClearSecondaryDomainsMessage
  | ClearPastedDomainsMessage
  | GetFormatMemoryMessage
  | SetFormatMemoryMessage
  | GetAllFormatsMessage
  | DeleteFormatMessage
  | ClearAllFormatsMessage
  | GetUnusedBacklinksMessage
  | ShuffleBacklinksMessage
  | OpenGatewayMenuMessage
  | ActivateFakeMailMessage
  | ActivateConverterMessage
  | MasterSwitchToggleMessage
  | GoldMineShuffleMessage
  | ToggleGoldMineMessage
  | QuadFillMessage           // <-- added
  | ShowToastMessage
  | ContextMenuPasteMessage;