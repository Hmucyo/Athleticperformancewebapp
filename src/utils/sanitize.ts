/**
 * Input sanitization utilities for XSS protection
 * 
 * Note: For production, consider using DOMPurify library for HTML sanitization
 * For now, we provide basic text sanitization
 */

/**
 * Sanitize plain text - removes HTML tags and dangerous characters
 */
export const sanitizeText = (text: string): string => {
  if (typeof text !== 'string') return '';
  
  // Remove HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');
  
  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: URLs that could be dangerous
  sanitized = sanitized.replace(/data:(?!image\/png|image\/jpeg|image\/gif|image\/webp)/gi, '');
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
};

/**
 * Sanitize HTML content (basic - for production use DOMPurify)
 * This is a basic implementation. For production, use DOMPurify library.
 */
export const sanitizeHTML = (html: string): string => {
  if (typeof html !== 'string') return '';
  
  // Basic HTML sanitization - allow only safe tags
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const allowedAttributes: string[] = [];
  
  // Remove script tags
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove dangerous data URLs
  sanitized = sanitized.replace(/data:(?!image\/png|image\/jpeg|image\/gif|image\/webp)/gi, '');
  
  return sanitized;
};

/**
 * Escape HTML entities
 */
export const escapeHTML = (text: string): string => {
  if (typeof text !== 'string') return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

/**
 * Sanitize user input for display
 */
export const sanitizeForDisplay = (input: string): string => {
  return escapeHTML(sanitizeText(input));
};
