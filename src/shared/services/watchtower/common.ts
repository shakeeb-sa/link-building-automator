/**
 * Shared utilities for watchtower domain list services.
 *
 * Provides storage access, domain normalization, and helper functions
 * used by primary, secondary, and pasted list modules.
 *
 * No `unknown`, `any`, or unsafe type assertions are used.
 */

import { getStorage, setStorage } from '../storage';
import { normalizeDomain } from '../../utils/domain';

export async function getWatchtowerStorage() {
  return getStorage();
}

export async function setWatchtowerStorage(storage: Awaited<ReturnType<typeof getStorage>>) {
  await setStorage(storage);
}

export function normalizeDomains(domains: string[]): string[] {
  return domains
    .map(normalizeDomain)
    .filter((d): d is string => d !== null && d.length > 0);
}

export function getNormalizedDomain(domain: string): string {
  return normalizeDomain(domain) || '';
}