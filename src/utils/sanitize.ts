/**
 * Input sanitization utilities.
 * Strips HTML/XSS vectors and enforces length limits.
 */

const MAX_INPUT_LENGTH = 5000;

/**
 * Strip HTML tags and common XSS vectors from user input.
 */
export function sanitizeInput(raw: string): string {
  let text = raw.trim();

  // Enforce character limit
  if (text.length > MAX_INPUT_LENGTH) {
    text = text.slice(0, MAX_INPUT_LENGTH);
  }

  // Strip HTML tags
  text = text.replace(/<[^>]*>/g, '');

  // Strip common XSS patterns
  text = text.replace(/javascript:/gi, '');
  text = text.replace(/on\w+\s*=/gi, '');
  text = text.replace(/data:\s*text\/html/gi, '');

  return text;
}

/**
 * Escape HTML entities for safe rendering.
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"'']/g, (c) => map[c] || c);
}
