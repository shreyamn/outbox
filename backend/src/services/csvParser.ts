import { parse } from 'csv-parse/sync';

export interface ParsedEmail {
  email: string;
  name?: string;
}

/**
 * Parse a CSV buffer and extract unique, normalized email addresses.
 * Supports headers: email, Email, EMAIL, name, Name, NAME
 * Also supports raw single-column CSV with just addresses.
 */
export function parseEmailsFromCsv(buffer: Buffer): ParsedEmail[] {
  let records: Record<string, string>[];

  try {
    records = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];
  } catch {
    // Fallback: treat as single-column, no header
    const lines = buffer.toString().split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    records = lines.map((line) => ({ email: line }));
  }

  const seen = new Set<string>();
  const results: ParsedEmail[] = [];

  for (const row of records) {
    // Find email field (case-insensitive)
    const emailKey = Object.keys(row).find((k) => k.toLowerCase() === 'email');
    const nameKey = Object.keys(row).find((k) => k.toLowerCase() === 'name');

    if (!emailKey) continue;

    const raw = row[emailKey]?.trim().toLowerCase();
    if (!raw || !isValidEmail(raw)) continue;
    if (seen.has(raw)) continue; // deduplicate

    seen.add(raw);
    results.push({
      email: raw,
      name: nameKey ? row[nameKey]?.trim() || undefined : undefined,
    });
  }

  return results;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
