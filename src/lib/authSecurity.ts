/**
 * Chicken Farm Pro — Single Authorized Google Account Security
 * 
 * Exclusively Authorized Account: mjohn.suji@gmail.com
 * Case-insensitive & whitespace-normalized comparison.
 */

export const AUTHORIZED_EMAIL = 'mjohn.suji@gmail.com';

export function isEmailAuthorized(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return normalized === AUTHORIZED_EMAIL.toLowerCase();
}

export function getAuthorizedEmail(): string {
  return AUTHORIZED_EMAIL;
}
