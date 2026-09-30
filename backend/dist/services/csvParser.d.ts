export interface ParsedEmail {
    email: string;
    name?: string;
}
/**
 * Parse a CSV buffer and extract unique, normalized email addresses.
 * Supports headers: email, Email, EMAIL, name, Name, NAME
 * Also supports raw single-column CSV with just addresses.
 */
export declare function parseEmailsFromCsv(buffer: Buffer): ParsedEmail[];
//# sourceMappingURL=csvParser.d.ts.map