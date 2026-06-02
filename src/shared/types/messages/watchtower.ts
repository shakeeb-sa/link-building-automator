/**
 * Watchtower message types for the extension's messaging system.
 *
 * Defines all messages related to domain collision detection:
 * - Checking domain status against watchtower lists
 * - Retrieving all watchtower lists (primary, secondary, pasted)
 * - Adding domains to primary/secondary lists
 * - Setting the pasted domains list
 * - Clearing individual lists
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import type { BaseMessage } from './base';
import type { IWatchtowerStatus } from '../watchtower';
import type { IWatchtowerLists } from '../storage';

// ----------------------------------------------------------------------------
// GET_WATCHTOWER_STATUS – check if a domain is blocked
// ----------------------------------------------------------------------------
export type GetWatchtowerStatusMessage = BaseMessage<'GET_WATCHTOWER_STATUS'> & {
  payload: { domain: string };
};
export type GetWatchtowerStatusResponse = IWatchtowerStatus;

// ----------------------------------------------------------------------------
// GET_WATCHTOWER_LISTS – retrieve all three domain lists
// ----------------------------------------------------------------------------
export type GetWatchtowerListsMessage = BaseMessage<'GET_WATCHTOWER_LISTS'>;
export type GetWatchtowerListsResponse = {
  primary: string[];
  secondary: string[];
  pasted: string[];
};

// ----------------------------------------------------------------------------
// UPDATE_WATCHTOWER_LISTS – replace all lists at once
// ----------------------------------------------------------------------------
export type UpdateWatchtowerListsMessage = BaseMessage<'UPDATE_WATCHTOWER_LISTS'> & {
  payload: { lists: IWatchtowerLists };
};
export type UpdateWatchtowerListsResponse = { success: boolean };

// ----------------------------------------------------------------------------
// ADD_PRIMARY_DOMAINS – append domains to the primary list
// ----------------------------------------------------------------------------
export type AddPrimaryDomainsMessage = BaseMessage<'ADD_PRIMARY_DOMAINS'> & {
  payload: { domains: string[] };
};
export type AddPrimaryDomainsResponse = { success: boolean };

// ----------------------------------------------------------------------------
// ADD_SECONDARY_DOMAINS – append domains to the secondary list
// ----------------------------------------------------------------------------
export type AddSecondaryDomainsMessage = BaseMessage<'ADD_SECONDARY_DOMAINS'> & {
  payload: { domains: string[] };
};
export type AddSecondaryDomainsResponse = { success: boolean };

// ----------------------------------------------------------------------------
// SET_PASTED_DOMAINS – replace the entire pasted list
// ----------------------------------------------------------------------------
export type SetPastedDomainsMessage = BaseMessage<'SET_PASTED_DOMAINS'> & {
  payload: { domains: string[] };
};
export type SetPastedDomainsResponse = { success: boolean };

// ----------------------------------------------------------------------------
// CLEAR_PRIMARY_DOMAINS – empty the primary list
// ----------------------------------------------------------------------------
export type ClearPrimaryDomainsMessage = BaseMessage<'CLEAR_PRIMARY_DOMAINS'>;
export type ClearPrimaryDomainsResponse = { success: boolean };

// ----------------------------------------------------------------------------
// CLEAR_SECONDARY_DOMAINS – empty the secondary list
// ----------------------------------------------------------------------------
export type ClearSecondaryDomainsMessage = BaseMessage<'CLEAR_SECONDARY_DOMAINS'>;
export type ClearSecondaryDomainsResponse = { success: boolean };

// ----------------------------------------------------------------------------
// CLEAR_PASTED_DOMAINS – empty the pasted list
// ----------------------------------------------------------------------------
export type ClearPastedDomainsMessage = BaseMessage<'CLEAR_PASTED_DOMAINS'>;
export type ClearPastedDomainsResponse = { success: boolean };