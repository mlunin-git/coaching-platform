"use client";

interface SkeletonLoaderProps {
  type?: "card" | "list" | "text" | "avatar";
  count?: number;
  className?: string;
}

/**
 * Reusable skeleton loader component for loading states
 * Shows animated placeholder while content is loading
 */
export function SkeletonLoader({
  type = "card",
  count = 1,
  className = "",
}: SkeletonLoaderProps) {
  const baseClasses = "animate-pulse bg-gray-200 rounded";

  // Accessibility: announce loading state to screen readers
  const ariaLabel = `Loading ${type}${count > 1 ? ` (${count} items)` : ""}`;

  const variants = {
    card: () => (
      <div
        className={`bg-white rounded-lg shadow p-6 space-y-4 ${className}`}
        role="status"
        aria-busy="true"
        aria-label={ariaLabel}
      >
        <div className={`${baseClasses} h-8 w-1/2`} aria-hidden="true" />
        <div className={`${baseClasses} h-4 w-full`} aria-hidden="true" />
        <div className={`${baseClasses} h-4 w-3/4`} aria-hidden="true" />
        <div className="flex gap-4 pt-4">
          <div className={`${baseClasses} h-10 w-20`} aria-hidden="true" />
          <div className={`${baseClasses} h-10 w-20`} aria-hidden="true" />
        </div>
      </div>
    ),
    list: () => (
      <div
        className={`space-y-3 ${className}`}
        role="status"
        aria-busy="true"
        aria-label={ariaLabel}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`bg-white rounded-lg shadow p-4 space-y-3`}>
            <div className={`${baseClasses} h-5 w-2/3`} aria-hidden="true" />
            <div className={`${baseClasses} h-4 w-full`} aria-hidden="true" />
            <div className="flex gap-2">
              <div className={`${baseClasses} h-3 w-24`} aria-hidden="true" />
              <div className={`${baseClasses} h-3 w-24`} aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>
    ),
    text: () => (
      <div
        className={`space-y-2 ${className}`}
        role="status"
        aria-busy="true"
        aria-label={ariaLabel}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`${baseClasses} h-4 w-full`} aria-hidden="true" />
        ))}
      </div>
    ),
    avatar: () => (
      <div
        className={`flex gap-4 ${className}`}
        role="status"
        aria-busy="true"
        aria-label={ariaLabel}
      >
        <div className={`${baseClasses} h-12 w-12 rounded-full`} aria-hidden="true" />
        <div className="flex-1 space-y-2">
          <div className={`${baseClasses} h-4 w-1/2`} aria-hidden="true" />
          <div className={`${baseClasses} h-4 w-3/4`} aria-hidden="true" />
        </div>
      </div>
    ),
  };

  return variants[type]();
}
