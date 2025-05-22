/**
 * Formats a time interval in seconds into a human-readable string.
 *
 * @param seconds: The number of seconds to format.
 *
 * @returns:
 *    A formatted string representing the time interval in the most appropriate unit
 *    (seconds, hours, days, or weeks).
 *
 * @example
 *    formatInterval(3600) => "1 hours"
 *    formatInterval(86400) => "1 days"
 */
export const formatInterval = (seconds: number): string => {
  if (seconds < 3600) return `${seconds} seconds`;
  if (seconds < 86400) return `${seconds / 3600} hours`;
  if (seconds < 604800) return `${seconds / 86400} days`;
  return `${seconds / 604800} weeks`;
};
