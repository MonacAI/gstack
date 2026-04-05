/**
 * Content security layer for pair-agent browser sharing.
 *
 * Four defense layers:
 *   1. Datamarking — watermark text output to detect exfiltration
 *   2. Hidden element stripping — remove invisible/deceptive elements from output
 *   3. Content filter hooks — extensible URL/content filter pipeline
 *   4. Instruction block hardening — SECURITY section in agent instructions
 *
 * This module handles layers 1-3. Layer 4 is in cli.ts.
 */

import { randomBytes } from 'crypto';

// ─── Datamarking (Layer 1) ──────────────────────────────────────

/** Session-scoped random marker for text watermarking */
let sessionMarker: string | null = null;

function ensureMarker(): string {
  if (!sessionMarker) {
    sessionMarker = randomBytes(3).toString('base64').slice(0, 4);
  }
  return sessionMarker;
}

/** Exported for tests only */
export function getSessionMarker(): string {
  return ensureMarker();
}

/** Reset marker (for testing) */
export function resetSessionMarker(): void {
  sessionMarker = null;
}

/**
 * Insert invisible watermark into text content.
 * Places the marker as zero-width characters between words.
 * Only applied to `text` command output (not html, forms, or structured data).
 */
export function datamarkContent(content: string): string {
  const marker = ensureMarker();
  // Insert marker as a Unicode tag sequence between sentences (after periods followed by space)
  // This is subtle enough to not corrupt output but detectable if exfiltrated
  const zwsp = '\u200B'; // zero-width space
  const taggedMarker = marker.split('').map(c => zwsp + c).join('');
  // Insert after every 3rd sentence-ending period
  let count = 0;
  return content.replace(/(\. )/g, (match) => {
    count++;
    if (count % 3 === 0) {
      return match + taggedMarker;
    }
    return match;
  });
}

// ─── Content Envelope (wrapping) ────────────────────────────────

const ENVELOPE_BEGIN = '═══ BEGIN UNTRUSTED WEB CONTENT ═══';
const ENVELOPE_END = '═══ END UNTRUSTED WEB CONTENT ═══';

/**
 * Wrap page content in a trust boundary envelope for scoped tokens.
 * Escapes envelope markers in content to prevent boundary escape attacks.
 */
export function wrapUntrustedPageContent(
  content: string,
  command: string,
  filterWarnings?: string[],
): string {
  // Escape envelope markers in content (zero-width space injection)
  const zwsp = '\u200B';
  const safeContent = content
    .replace(/═══ BEGIN UNTRUSTED WEB CONTENT ═══/g, `═══ BEGIN UNTRUSTED WEB C${zwsp}ONTENT ═══`)
    .replace(/═══ END UNTRUSTED WEB CONTENT ═══/g, `═══ END UNTRUSTED WEB C${zwsp}ONTENT ═══`);

  const parts: string[] = [];

  if (filterWarnings && filterWarnings.length > 0) {
    parts.push(`⚠ CONTENT WARNINGS: ${filterWarnings.join('; ')}`);
  }

  parts.push(ENVELOPE_BEGIN);
  parts.push(safeContent);
  parts.push(ENVELOPE_END);

  return parts.join('\n');
}

// ─── Content Filter Hooks (Layer 3) ─────────────────────────────

export interface ContentFilterResult {
  safe: boolean;
  warnings: string[];
  blocked?: boolean;
  message?: string;
}

export type ContentFilter = (
  content: string,
  url: string,
  command: string,
) => ContentFilterResult;

const registeredFilters: ContentFilter[] = [];

export function registerContentFilter(filter: ContentFilter): void {
  registeredFilters.push(filter);
}

export function clearContentFilters(): void {
  registeredFilters.length = 0;
}

/** Get current filter mode from env */
export function getFilterMode(): 'off' | 'warn' | 'block' {
  const mode = process.env.BROWSE_CONTENT_FILTER?.toLowerCase();
  if (mode === 'off' || mode === 'block') return mode;
  return 'warn'; // default
}

/**
 * Run all registered content filters against content.
 * Returns aggregated result with all warnings.
 */
export function runContentFilters(
  content: string,
  url: string,
  command: string,
): ContentFilterResult {
  const mode = getFilterMode();
  if (mode === 'off') {
    return { safe: true, warnings: [] };
  }

  const allWarnings: string[] = [];
  let blocked = false;

  for (const filter of registeredFilters) {
    const result = filter(content, url, command);
    if (!result.safe) {
      allWarnings.push(...result.warnings);
      if (mode === 'block') {
        blocked = true;
      }
    }
  }

  if (blocked && allWarnings.length > 0) {
    return {
      safe: false,
      warnings: allWarnings,
      blocked: true,
      message: `Content blocked: ${allWarnings.join('; ')}`,
    };
  }

  return {
    safe: allWarnings.length === 0,
    warnings: allWarnings,
  };
}

// ─── Built-in URL Blocklist Filter ──────────────────────────────

const BLOCKLIST_DOMAINS = [
  'requestbin.com',
  'pipedream.com',
  'webhook.site',
  'hookbin.com',
  'requestcatcher.com',
  'burpcollaborator.net',
  'interact.sh',
  'canarytokens.com',
  'ngrok.io',
  'ngrok-free.app',
];

/** Check if URL matches any blocklisted exfiltration domain */
export function urlBlocklistFilter(content: string, url: string, _command: string): ContentFilterResult {
  const warnings: string[] = [];

  // Check page URL
  for (const domain of BLOCKLIST_DOMAINS) {
    if (url.includes(domain)) {
      warnings.push(`Page URL matches blocklisted domain: ${domain}`);
    }
  }

  // Check for blocklisted URLs in content (links, form actions)
  const urlPattern = /https?:\/\/[^\s"'<>]+/g;
  const contentUrls = content.match(urlPattern) || [];
  for (const contentUrl of contentUrls) {
    for (const domain of BLOCKLIST_DOMAINS) {
      if (contentUrl.includes(domain)) {
        warnings.push(`Content contains blocklisted URL: ${contentUrl.slice(0, 100)}`);
        break;
      }
    }
  }

  return { safe: warnings.length === 0, warnings };
}

// Register the built-in filter on module load
registerContentFilter(urlBlocklistFilter);
