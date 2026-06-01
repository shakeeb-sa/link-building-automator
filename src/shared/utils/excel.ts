import * as XLSX from 'xlsx';
import { normalizeDomain, isValidUrl } from './domain';

/**
 * Result of parsing an Excel file for domain lists.
 */
export interface ExcelParseResult {
  domains: string[];
  totalRows: number;
  errors: string[];
}

/**
 * Parses an Excel file and returns an array of unique, normalized domains.
 * Used for Watchtower primary/secondary uploads.
 */
export async function parseExcelToDomains(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: 'array' });
        const domainSet = new Set<string>();

        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
            header: 1,
            defval: '',
            blankrows: false,
          });

          for (const row of rawRows) {
            for (const cell of row as unknown[]) {
              if (typeof cell !== 'string') continue;
              const trimmed = cell.trim();
              if (!trimmed) continue;

              // Try to normalize as domain (URL or naked domain)
              let normalized = '';
              if (isValidUrl(trimmed)) {
                try {
                  const url = new URL(trimmed);
                  normalized = url.hostname.replace(/^www\./i, '');
                } catch {
                  continue;
                }
              } else {
                // Assume it's a domain name already
                normalized = normalizeDomain(trimmed);
              }

              if (normalized && normalized.length > 3) {
                domainSet.add(normalized);
              }
            }
          }
        }

        resolve(Array.from(domainSet));
      } catch (err) {
        reject(new Error(`Failed to parse Excel: ${err instanceof Error ? err.message : String(err)}`));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parses an Excel file and returns categorized URLs by sheet name.
 * Each sheet contains a list of backlink URLs.
 * Used for Unused Backlinks feature.
 */
export async function parseExcelToCategorized(file: File): Promise<Record<string, string[]>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: 'array' });
        const result: Record<string, string[]> = {};

        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
            header: 1,
            defval: '',
            blankrows: false,
          });

          const urls: string[] = [];

          for (const row of rawRows) {
            for (const cell of row as unknown[]) {
              if (typeof cell !== 'string') continue;
              const trimmed = cell.trim();
              if (!trimmed) continue;
              // Accept full URLs only (must start with http)
              if (isValidUrl(trimmed)) {
                urls.push(trimmed);
              }
            }
          }

          // Deduplicate URLs within the same sheet (preserve order)
          const uniqueUrls = Array.from(new Set(urls));
          if (uniqueUrls.length > 0) {
            result[sheetName] = uniqueUrls;
          }
        }

        resolve(result);
      } catch (err) {
        reject(new Error(`Failed to parse categorized Excel: ${err instanceof Error ? err.message : String(err)}`));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}