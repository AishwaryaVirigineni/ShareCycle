/**
 * Name utilities for user display
 * Extracts initials and short IDs for privacy-first display
 */

/**
 * Get single initial from display name or user ID
 */
export function initialForUser(displayName?: string | null, userId?: string | null): string {
  if (displayName && displayName.length > 0) {
    return displayName.charAt(0).toUpperCase();
  }
  if (userId && userId.length > 0) {
    // Use first alphanumeric character from userId
    const match = userId.match(/[a-zA-Z0-9]/);
    if (match) {
      return match[0].toUpperCase();
    }
  }
  return '?';
}

/**
 * Get two-digit hash (00-99) from userId
 */
export function userIdHash(userId?: string | null): string {
  if (!userId || userId.length === 0) {
    return '00';
  }
  // Simple hash: sum char codes mod 100
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash + userId.charCodeAt(i)) % 100;
  }
  return hash.toString().padStart(2, '0');
}

/**
 * Format requester label: "Requester XYY" where X is initial, YY is hash
 */
export function formatRequesterLabel(displayName?: string | null, userId?: string | null): string {
  const initial = initialForUser(displayName, userId);
  const hash = userIdHash(userId);
  return `Requester ${initial}${hash}`;
}

/**
 * Format helper label: "Samaritan"
 */
export function formatHelperLabel(): string {
  return 'Samaritan';
}

/**
 * Get short user ID for display (last 4 chars) - legacy support
 */
export function shortUserId(userId?: string | null): string {
  if (!userId || userId.length === 0) {
    return 'Unknown';
  }
  return userId.slice(-4);
}

/**
 * Format user display: "User 6fa8" - legacy support
 */
export function formatUserDisplay(userId?: string | null): string {
  return `User ${shortUserId(userId)}`;
}

