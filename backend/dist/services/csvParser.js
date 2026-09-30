"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEmailsFromCsv = parseEmailsFromCsv;
const sync_1 = require("csv-parse/sync");
/**
 * Parse a CSV buffer and extract unique, normalized email addresses.
 * Supports headers: email, Email, EMAIL, name, Name, NAME
 * Also supports raw single-column CSV with just addresses.
 */
function parseEmailsFromCsv(buffer) {
    let records;
    try {
        records = (0, sync_1.parse)(buffer, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });
    }
    catch {
        // Fallback: treat as single-column, no header
        const lines = buffer.toString().split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        records = lines.map((line) => ({ email: line }));
    }
    const seen = new Set();
    const results = [];
    for (const row of records) {
        // Find email field (case-insensitive)
        const emailKey = Object.keys(row).find((k) => k.toLowerCase() === 'email');
        const nameKey = Object.keys(row).find((k) => k.toLowerCase() === 'name');
        if (!emailKey)
            continue;
        const raw = row[emailKey]?.trim().toLowerCase();
        if (!raw || !isValidEmail(raw))
            continue;
        if (seen.has(raw))
            continue; // deduplicate
        seen.add(raw);
        results.push({
            email: raw,
            name: nameKey ? row[nameKey]?.trim() || undefined : undefined,
        });
    }
    return results;
}
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
//# sourceMappingURL=csvParser.js.map