import type { IProfile, IProfileData, FormatType, IWatchtowerLists } from './storage';
import type { IWatchtowerStatus } from './watchtower';
import type { BacklinkBatch } from './unusedBacklinks';

/**
 * All possible message types (literal union).
 */
export type MessageType =
  | 'GET_ACTIVE_PROFILE'
  | 'GET_PROFILE_DATA'
  | 'SET_ACTIVE_PROFILE'
  | 'UPDATE_PROFILE_DATA'
  | 'GET_WATCHTOWER_STATUS'
  | 'UPDATE_WATCHTOWER_LISTS'
  | 'GET_FORMAT_MEMORY'
  | 'SET_FORMAT_MEMORY'
  | 'GET_UNUSED_BACKLINKS'
  | 'SHUFFLE_BACKLINKS'
  | 'SHOW_TOAST'
  | 'OPEN_GATEWAY_MENU'
  | 'ACTIVATE_FAKEMAIL'
  | 'ACTIVATE_CONVERTER'
  | 'MASTER_SWITCH_TOGGLE'
  | 'GOLD_MINE_SHUFFLE'
  | 'CONTEXT_MENU_PASTE'
  | 'GET_ALL_PROFILES'
  | 'CREATE_PROFILE'
  | 'UPDATE_PROFILE'
  | 'DELETE_PROFILE'
  | 'ADD_PRIMARY_DOMAINS'
  | 'ADD_SECONDARY_DOMAINS'
  | 'SET_PASTED_DOMAINS'
  | 'CLEAR_PRIMARY_DOMAINS'
  | 'CLEAR_SECONDARY_DOMAINS'
  | 'CLEAR_PASTED_DOMAINS'
  | 'GET_ALL_FORMATS'
  | 'DELETE_FORMAT'
  | 'CLEAR_ALL_FORMATS'
  | 'TOGGLE_GOLD_MINE';

/**
 * Base message shape – all messages have a type.
 */
interface BaseMessage<T extends MessageType> {
  type: T;
}

// ----------------------------------------------------------------------------
// Profile messages
// ----------------------------------------------------------------------------

export type GetActiveProfileMessage = BaseMessage<'GET_ACTIVE_PROFILE'>;
export type GetActiveProfileResponse = { profile: IProfile | null };

export type GetProfileDataMessage = BaseMessage<'GET_PROFILE_DATA'>;
export type GetProfileDataResponse = { data: IProfileData | null };

export type SetActiveProfileMessage = BaseMessage<'SET_ACTIVE_PROFILE'> & {
  payload: { profileId: string };
};
export type SetActiveProfileResponse = { success: boolean };

export type UpdateProfileDataMessage = BaseMessage<'UPDATE_PROFILE_DATA'> & {
  payload: Partial<IProfileData>;
};
export type UpdateProfileDataResponse = { success: boolean; data: IProfileData };

// ----------------------------------------------------------------------------
// Watchtower messages
// ----------------------------------------------------------------------------

export type GetWatchtowerStatusMessage = BaseMessage<'GET_WATCHTOWER_STATUS'> & {
  payload: { domain: string };
};
export type GetWatchtowerStatusResponse = IWatchtowerStatus;

export type UpdateWatchtowerListsMessage = BaseMessage<'UPDATE_WATCHTOWER_LISTS'> & {
  payload: { lists: IWatchtowerLists };
};
export type UpdateWatchtowerListsResponse = { success: boolean };

// ----------------------------------------------------------------------------
// Format Memory messages
// ----------------------------------------------------------------------------

export type GetFormatMemoryMessage = BaseMessage<'GET_FORMAT_MEMORY'> & {
  payload: { domain: string };
};
export type GetFormatMemoryResponse = { format: FormatType | null };

export type SetFormatMemoryMessage = BaseMessage<'SET_FORMAT_MEMORY'> & {
  payload: { domain: string; format: FormatType };
};
export type SetFormatMemoryResponse = { success: boolean };

// ----------------------------------------------------------------------------
// Unused Backlinks messages
// ----------------------------------------------------------------------------

export type GetUnusedBacklinksMessage = BaseMessage<'GET_UNUSED_BACKLINKS'>;
export type GetUnusedBacklinksResponse = { batch: BacklinkBatch | null };

export type ShuffleBacklinksMessage = BaseMessage<'SHUFFLE_BACKLINKS'> & {
  payload: { sheetNames?: string[] };
};
export type ShuffleBacklinksResponse = { batch: BacklinkBatch };

// ----------------------------------------------------------------------------
// UI feedback messages
// ----------------------------------------------------------------------------

export type ShowToastMessage = BaseMessage<'SHOW_TOAST'> & {
  payload: { message: string; type: 'success' | 'error' | 'info' };
};

// ----------------------------------------------------------------------------
// Navigation & overlay messages
// ----------------------------------------------------------------------------

export type OpenGatewayMenuMessage = BaseMessage<'OPEN_GATEWAY_MENU'> & {
  payload: { x: number; y: number };
};

export type ActivateFakeMailMessage = BaseMessage<'ACTIVATE_FAKEMAIL'>;
export type ActivateConverterMessage = BaseMessage<'ACTIVATE_CONVERTER'> & {
  payload: { returnTabId?: number };
};

// ----------------------------------------------------------------------------
// Toggle messages
// ----------------------------------------------------------------------------

export type MasterSwitchToggleMessage = BaseMessage<'MASTER_SWITCH_TOGGLE'> & {
  payload: { enabled: boolean };
};

export type GoldMineShuffleMessage = BaseMessage<'GOLD_MINE_SHUFFLE'>;

export type ToggleGoldMineMessage = BaseMessage<'TOGGLE_GOLD_MINE'> & {
  payload: { enabled: boolean };
};

// ----------------------------------------------------------------------------
// Context menu paste
// ----------------------------------------------------------------------------

export type ContextMenuPasteMessage = BaseMessage<'CONTEXT_MENU_PASTE'> & {
  payload: { text: string; isRich: boolean; format?: FormatType };
};

// ----------------------------------------------------------------------------
// Additional CRUD messages for profiles
// ----------------------------------------------------------------------------

export type GetAllProfilesMessage = BaseMessage<'GET_ALL_PROFILES'>;
export type GetAllProfilesResponse = { profiles: IProfile[] };

export type CreateProfileMessage = BaseMessage<'CREATE_PROFILE'> & {
  payload: { name: string };
};
export type CreateProfileResponse = { profile: IProfile };

export type UpdateProfileMessage = BaseMessage<'UPDATE_PROFILE'> & {
  payload: { id: string; updates: Partial<Pick<IProfile, 'name' | 'data'>> };
};
export type UpdateProfileResponse = { success: boolean };

export type DeleteProfileMessage = BaseMessage<'DELETE_PROFILE'> & {
  payload: { id: string };
};
export type DeleteProfileResponse = { success: boolean };

// ----------------------------------------------------------------------------
// Additional CRUD messages for watchtower
// ----------------------------------------------------------------------------

export type AddPrimaryDomainsMessage = BaseMessage<'ADD_PRIMARY_DOMAINS'> & {
  payload: { domains: string[] };
};
export type AddSecondaryDomainsMessage = BaseMessage<'ADD_SECONDARY_DOMAINS'> & {
  payload: { domains: string[] };
};
export type SetPastedDomainsMessage = BaseMessage<'SET_PASTED_DOMAINS'> & {
  payload: { domains: string[] };
};

export type ClearPrimaryDomainsMessage = BaseMessage<'CLEAR_PRIMARY_DOMAINS'>;
export type ClearSecondaryDomainsMessage = BaseMessage<'CLEAR_SECONDARY_DOMAINS'>;
export type ClearPastedDomainsMessage = BaseMessage<'CLEAR_PASTED_DOMAINS'>;

// ----------------------------------------------------------------------------
// Additional CRUD messages for format memory
// ----------------------------------------------------------------------------

export type GetAllFormatsMessage = BaseMessage<'GET_ALL_FORMATS'>;
export type GetAllFormatsResponse = { formats: Record<string, FormatType> };

export type DeleteFormatMessage = BaseMessage<'DELETE_FORMAT'> & {
  payload: { domain: string };
};
export type DeleteFormatResponse = { success: boolean };

export type ClearAllFormatsMessage = BaseMessage<'CLEAR_ALL_FORMATS'>;

// ----------------------------------------------------------------------------
// Discriminated union of all messages (used in runtime.onMessage)
// ----------------------------------------------------------------------------

export type ExtensionMessage =
  | GetActiveProfileMessage
  | GetProfileDataMessage
  | SetActiveProfileMessage
  | UpdateProfileDataMessage
  | GetWatchtowerStatusMessage
  | UpdateWatchtowerListsMessage
  | GetFormatMemoryMessage
  | SetFormatMemoryMessage
  | GetUnusedBacklinksMessage
  | ShuffleBacklinksMessage
  | ShowToastMessage
  | OpenGatewayMenuMessage
  | ActivateFakeMailMessage
  | ActivateConverterMessage
  | MasterSwitchToggleMessage
  | GoldMineShuffleMessage
  | ToggleGoldMineMessage
  | ContextMenuPasteMessage
  | GetAllProfilesMessage
  | CreateProfileMessage
  | UpdateProfileMessage
  | DeleteProfileMessage
  | AddPrimaryDomainsMessage
  | AddSecondaryDomainsMessage
  | SetPastedDomainsMessage
  | ClearPrimaryDomainsMessage
  | ClearSecondaryDomainsMessage
  | ClearPastedDomainsMessage
  | GetAllFormatsMessage
  | DeleteFormatMessage
  | ClearAllFormatsMessage;