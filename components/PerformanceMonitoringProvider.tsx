'use client';

import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

/**
 * Provider component that initializes performance monitoring for the entire application
 *
 * Wraps the app to enable Web Vitals tracking, API call monitoring, and other
 * performance metrics collection. Should be placed near the root of your app.
 *
 * @example
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <PerformanceMonitoringProvider>
 *           {children}
 *         </PerformanceMonitoringProvider>
 *       </body>
 *     </html>
 *   );
 * }
 */
export function PerformanceMonitoringProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize performance monitoring on component mount
  usePerformanceMonitoring();

  return <>{children}</>;
}
