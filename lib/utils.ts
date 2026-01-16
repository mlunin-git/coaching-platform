/**
 * Combine class names, filtering out falsy values
 * Useful for conditional styling in React components
 * @param classes - Variable number of class names or falsy values to combine
 * @returns Combined class string with spaces between valid classes
 * @example
 * cn('btn', isActive && 'active', disabled && false) // 'btn active'
 */
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format a date to a localized string representation
 * Uses US English locale with full month and day names
 * @param date - Date string or Date object to format
 * @returns Formatted date string (e.g., "January 16, 2025")
 * @example
 * formatDate('2025-01-16') // 'January 16, 2025'
 * formatDate(new Date()) // 'January 16, 2025'
 */
export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
