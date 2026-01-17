/**
 * Performance monitoring and Web Vitals tracking
 * Integrates with Sentry for tracking and reporting
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Performance metric data structure
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  tags?: Record<string, string>;
}

/**
 * Layout Shift entry for CLS (Cumulative Layout Shift) tracking
 */
interface LayoutShift {
  hadRecentInput: boolean;
  value: number;
}

/**
 * Start a performance timer for measuring operation duration
 *
 * @param operationName - Name of the operation being measured
 * @returns Function to call when operation completes, returns duration in milliseconds
 *
 * @example
 * const stopTimer = startTimer('api_call_getClients');
 * // ... perform operation
 * const duration = stopTimer();
 * console.log(`Operation took ${duration}ms`);
 */
export function startTimer(operationName: string): () => number {
  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    recordMetric({
      name: operationName,
      value: duration,
      unit: 'ms',
    });
    return duration;
  };
}

/**
 * Record a custom performance metric
 *
 * Sends the metric to Sentry for tracking and analysis.
 * Useful for monitoring application-specific performance characteristics.
 *
 * @param metric - The performance metric to record
 *
 * @example
 * recordMetric({
 *   name: 'form_validation_time',
 *   value: 45,
 *   unit: 'ms',
 *   tags: { formName: 'clientCreation' }
 * });
 *
 * @remarks
 * - Metrics are sent to Sentry with the 'metric' level
 * - Include tags for better filtering and analysis
 * - Common units: 'ms' for duration, 'bytes' for size, 'count' for occurrences
 */
export function recordMetric(metric: PerformanceMetric): void {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[METRIC] ${metric.name}: ${metric.value}${metric.unit}`, metric.tags || {});
  }

  // Send to Sentry
  Sentry.captureMessage(`Performance: ${metric.name}`, {
    level: 'info',
    tags: {
      metric_name: metric.name,
      metric_unit: metric.unit,
      ...metric.tags,
    },
    extra: {
      value: metric.value,
    },
  });
}

/**
 * Measure API call duration and success/failure
 *
 * Wraps an API call to automatically track timing and errors.
 *
 * @param operationName - Name for tracking the API operation
 * @param apiCall - Async function that makes the API call
 * @returns Promise resolving to the API result
 *
 * @example
 * const clients = await measureApiCall('fetch_clients', () =>
 *   supabase.from('clients').select('*')
 * );
 */
export async function measureApiCall<T>(
  operationName: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const stopTimer = startTimer(`api_${operationName}`);

  try {
    const result = await apiCall();
    recordMetric({
      name: `${operationName}_success`,
      value: 1,
      unit: 'count',
    });
    return result;
  } catch (error) {
    recordMetric({
      name: `${operationName}_error`,
      value: 1,
      unit: 'count',
    });
    throw error;
  } finally {
    stopTimer();
  }
}

/**
 * Track Web Vitals (Core Web Vitals and other metrics)
 *
 * Registers performance observers for browser navigation and resource timing.
 * Captures LCP, FID/INP, CLS, and other Web Vitals.
 *
 * @example
 * // Call once on app initialization
 * if (typeof window !== 'undefined') {
 *   trackWebVitals();
 * }
 *
 * @remarks
 * - Browser-only: Uses performance observers not available in Node.js
 * - Automatically sends metrics to Sentry
 * - Should be called early in application lifecycle
 * - No teardown needed (observers remain active)
 */
export function trackWebVitals(): void {
  if (typeof window === 'undefined') return;

  // Track Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;

      recordMetric({
        name: 'web_vital_lcp',
        value: lastEntry.renderTime || lastEntry.loadTime || 0,
        unit: 'ms',
        tags: { vital_type: 'lcp' },
      });
    });

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (error) {
    // LCP observer not supported
  }

  // Track First Input Delay (FID) or Interaction to Next Paint (INP)
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        recordMetric({
          name: 'web_vital_fid',
          value: (entry as any).processingDuration || 0,
          unit: 'ms',
          tags: { vital_type: 'fid' },
        });
      });
    });

    fidObserver.observe({ entryTypes: ['first-input', 'largest-contentful-paint'] });
  } catch (error) {
    // FID observer not supported
  }

  // Track Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // LayoutShift entries have hadRecentInput and value properties
        const layoutShiftEntry = entry as unknown as LayoutShift;
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value;
          recordMetric({
            name: 'web_vital_cls',
            value: clsValue,
            unit: 'count',
            tags: { vital_type: 'cls' },
          });
        }
      });
    });

    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (error) {
    // CLS observer not supported
  }

  // Track Navigation Timing (page load)
  if (document.readyState === 'complete') {
    recordNavigationTiming();
  } else {
    window.addEventListener('load', recordNavigationTiming);
  }
}

/**
 * Record page navigation and load timing metrics
 *
 * Captures timing for DNS lookup, TCP connection, DOM interactive, etc.
 *
 * @internal
 */
function recordNavigationTiming(): void {
  if (typeof window === 'undefined') return;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (!navigation) return;

  // Time to First Byte (TTFB)
  const ttfb = navigation.responseStart - navigation.requestStart;
  recordMetric({
    name: 'page_ttfb',
    value: ttfb,
    unit: 'ms',
  });

  // DOM Content Loaded
  if (navigation.domContentLoadedEventEnd > 0) {
    const domTime = navigation.domContentLoadedEventEnd - navigation.requestStart;
    recordMetric({
      name: 'page_dom_loaded',
      value: domTime,
      unit: 'ms',
    });
  }

  // Full page load time
  if (navigation.loadEventEnd > 0) {
    const loadTime = navigation.loadEventEnd - navigation.requestStart;
    recordMetric({
      name: 'page_load_time',
      value: loadTime,
      unit: 'ms',
    });
  }
}

/**
 * Track form submission timing and success rates
 *
 * @param formName - Name of the form being submitted
 * @param submitFn - Async function that handles form submission
 * @returns Promise resolving to the submission result
 *
 * @example
 * const handleSubmit = async (e: React.FormEvent) => {
 *   e.preventDefault();
 *   try {
 *     await trackFormSubmission('clientCreation', async () => {
 *       return await createClient(formData);
 *     });
 *   } catch (error) {
 *     // handle error
 *   }
 * };
 */
export async function trackFormSubmission<T>(
  formName: string,
  submitFn: () => Promise<T>
): Promise<T> {
  const stopTimer = startTimer(`form_${formName}_submit`);

  try {
    const result = await submitFn();
    recordMetric({
      name: `form_${formName}_success`,
      value: 1,
      unit: 'count',
    });
    return result;
  } catch (error) {
    recordMetric({
      name: `form_${formName}_error`,
      value: 1,
      unit: 'count',
    });
    throw error;
  } finally {
    stopTimer();
  }
}

/**
 * Track component render performance
 *
 * Uses React Profiler API to measure component rendering time.
 * Should be used with React.memo or useMemo to see performance benefits.
 *
 * @param componentName - Name of the component being measured
 * @param phase - 'mount' or 'update'
 * @param actualDuration - Time spent rendering component (in milliseconds)
 * @param baseDuration - Time to render without memoization (in milliseconds)
 *
 * @example
 * // In component with React.Profiler wrapper
 * function onRenderCallback(
 *   id, // 'component.Profile'
 *   phase, // 'mount' or 'update'
 *   actualDuration, // time spent rendering
 *   baseDuration, // estimated time without memoization
 *   startTime, // when React started rendering
 *   commitTime, // when React committed update
 *   interactions // Set of interactions
 * ) {
 *   trackComponentRender(id, phase, actualDuration, baseDuration);
 * }
 *
 * <React.Profiler name="ClientList" onRender={onRenderCallback}>
 *   <ClientList />
 * </React.Profiler>
 */
export function trackComponentRender(
  componentName: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number
): void {
  recordMetric({
    name: `component_${componentName}_${phase}`,
    value: actualDuration,
    unit: 'ms',
    tags: {
      phase,
      base_duration: baseDuration.toString(),
    },
  });

  // Alert if component took too long to render
  if (actualDuration > 1000) {
    recordMetric({
      name: `component_slow_render`,
      value: actualDuration,
      unit: 'ms',
      tags: {
        component: componentName,
        phase,
      },
    });
  }
}

/**
 * Track data fetching performance by collection
 *
 * @param collectionName - Name of the database collection (e.g., 'clients', 'tasks')
 * @param recordCount - Number of records fetched
 * @param duration - Time taken to fetch (in milliseconds)
 *
 * @example
 * const stopTimer = startTimer('fetch_clients');
 * const { data } = await supabase.from('clients').select();
 * const duration = stopTimer();
 * trackDataFetch('clients', data?.length || 0, duration);
 */
export function trackDataFetch(
  collectionName: string,
  recordCount: number,
  duration: number
): void {
  recordMetric({
    name: `data_fetch_${collectionName}`,
    value: duration,
    unit: 'ms',
    tags: {
      collection: collectionName,
      record_count: recordCount.toString(),
    },
  });
}

/**
 * Track memory usage (if available in browser)
 *
 * Only works in browsers with memory performance API (Chrome/Edge).
 *
 * @example
 * trackMemoryUsage();
 *
 * @remarks
 * - Not available in all browsers
 * - Requires --enable-precise-memory-info flag in Chrome
 * - Safe to call even if not supported
 */
export function trackMemoryUsage(): void {
  if (typeof window === 'undefined') return;

  const memory = (performance as any).memory;
  if (!memory) return;

  recordMetric({
    name: 'memory_used_bytes',
    value: memory.usedJSHeapSize,
    unit: 'bytes',
  });

  recordMetric({
    name: 'memory_limit_bytes',
    value: memory.jsHeapSizeLimit,
    unit: 'bytes',
  });
}

/**
 * Initialize all performance monitoring
 *
 * Call once on application startup to enable all performance tracking.
 * Should be called from your app root or layout component.
 *
 * @example
 * // app/layout.tsx
 * export default function RootLayout({ children }) {
 *   useEffect(() => {
 *     if (typeof window !== 'undefined') {
 *       initializePerformanceMonitoring();
 *     }
 *   }, []);
 *
 *   return <>{children}</>;
 * }
 */
export function initializePerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  trackWebVitals();

  // Track memory periodically (development only)
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      trackMemoryUsage();
    }, 30000); // Every 30 seconds
  }
}
