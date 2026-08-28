/**
 * Chicken Farm Pro — Gemini 3.1 Flash-Lite AI Configuration
 * 
 * Centralized configuration for the primary Google Gemini model.
 * Model ID: gemini-3.1-flash-lite
 */

// Centralized model name configuration
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

// Server-side only API key
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Status flag
export const IS_GEMINI_CONFIGURED = Boolean(
  GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 10
);

// Rate limiting settings
export const RATE_LIMIT = {
  MAX_REQUESTS_PER_MINUTE: 30,
  WINDOW_MS: 60 * 1000,
  MAX_MESSAGE_LENGTH: 4000,
};
