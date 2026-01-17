/**
 * React hook for performance monitoring integration
 */

import { useEffect, useRef, useCallback } from 'react';
import {
  startTimer,
  recordMetric,
  trackFormSubmission,
  initializePerformanceMonitoring,
} from '@/lib/performance-monitoring';

/**
 * Initialize performance monitoring on component mount
 *
 * Call this hook once in your root layout or app component to enable
 * all performance tracking including Web Vitals.
 *
 * @example
 * export default function RootLayout({ children }) {
 *   usePerformanceMonitoring();
 *   return <>{children}</>;
 * }
 */
export function usePerformanceMonitoring(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    initializePerformanceMonitoring();
  }, []);
}

/**
 * Track timing for async operations (API calls, data loading, etc.)
 *
 * Returns a wrapper function that automatically measures operation duration
 * and records the metric.
 *
 * @param operationName - Name for tracking the operation
 * @returns Function to wrap async operations
 *
 * @example
 * const { measureAsync } = useOperationTiming('loadClients');
 *
 * const loadClients = async () => {
 *   const clients = await measureAsync(async () => {
 *     return await supabase.from('clients').select();
 *   });
 *   setClients(clients);
 * };
 */
export function useOperationTiming(operationName: string) {
  const measureAsync = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      const stopTimer = startTimer(`${operationName}_duration`);
      try {
        return await fn();
      } finally {
        stopTimer();
      }
    },
    [operationName]
  );

  const recordCustomMetric = useCallback(
    (metricName: string, value: number, unit: 'ms' | 'bytes' | 'count' = 'ms') => {
      recordMetric({
        name: `${operationName}_${metricName}`,
        value,
        unit,
      });
    },
    [operationName]
  );

  return { measureAsync, recordCustomMetric };
}

/**
 * Track form submission timing and success
 *
 * Returns a handler function that wraps form submissions with performance tracking.
 *
 * @param formName - Name of the form being tracked
 * @returns Function to track form submission
 *
 * @example
 * const { trackSubmit } = useFormTiming('clientCreation');
 *
 * const handleSubmit = async (e: React.FormEvent) => {
 *   e.preventDefault();
 *   try {
 *     await trackSubmit(async () => {
 *       return await createClient(formData);
 *     });
 *   } catch (error) {
 *     setError(error.message);
 *   }
 * };
 */
export function useFormTiming(formName: string) {
  const trackSubmit = useCallback(
    async <T,>(submitFn: () => Promise<T>): Promise<T> => {
      return await trackFormSubmission(formName, submitFn);
    },
    [formName]
  );

  return { trackSubmit };
}

/**
 * Track render performance of a component
 *
 * Useful for monitoring which components are slow to render.
 *
 * @param componentName - Name of the component (for tracking)
 * @returns Object with component render info
 *
 * @example
 * function SlowComponent() {
 *   const { renderCount } = useRenderPerformance('ClientList');
 *
 *   useEffect(() => {
 *     console.log(`Rendered ${renderCount.current} times`);
 *   }, []);
 *
 *   return <ClientList />;
 * }
 */
export function useRenderPerformance(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current++;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    // Record if component is re-rendering frequently
    if (renderCount.current > 1 && timeSinceLastRender < 100) {
      recordMetric({
        name: 'component_rapid_rerender',
        value: 1,
        unit: 'count',
        tags: { component: componentName },
      });
    }
  });

  return { renderCount };
}

/**
 * Track data loading performance for lists/collections
 *
 * @param dataName - Name of the data being loaded (e.g., 'clients', 'tasks')
 * @returns Function to record data load metrics
 *
 * @example
 * const { recordDataLoad } = useDataLoadTiming('clients');
 *
 * useEffect(() => {
 *   const stopTimer = startTimer();
 *   supabase
 *     .from('clients')
 *     .select()
 *     .then((result) => {
 *       const duration = stopTimer();
 *       recordDataLoad(result.data?.length || 0, duration);
 *     });
 * }, []);
 */
export function useDataLoadTiming(dataName: string) {
  const recordDataLoad = useCallback(
    (recordCount: number, duration: number) => {
      recordMetric({
        name: `data_load_${dataName}`,
        value: duration,
        unit: 'ms',
        tags: {
          data_name: dataName,
          record_count: recordCount.toString(),
        },
      });
    },
    [dataName]
  );

  return { recordDataLoad };
}

/**
 * Track user interaction performance
 *
 * Useful for measuring response time to user actions like clicks, form submissions, etc.
 *
 * @param actionName - Name of the user action (e.g., 'submitForm', 'deleteClient')
 * @returns Function to start timing user action
 *
 * @example
 * const { startActionTimer } = useUserActionTiming('deleteClient');
 *
 * const handleDelete = async (clientId: string) => {
 *   const stopTimer = startActionTimer();
 *   try {
 *     await deleteClient(clientId);
 *     stopTimer('success');
 *   } catch (error) {
 *     stopTimer('error');
 *   }
 * };
 */
export function useUserActionTiming(actionName: string) {
  const startActionTimer = useCallback(
    (outcome?: 'success' | 'error') => {
      const stopTimer = startTimer(`user_action_${actionName}`);

      return (finalOutcome?: 'success' | 'error') => {
        const duration = stopTimer();
        const status = finalOutcome || outcome || 'completed';

        recordMetric({
          name: `user_action_${actionName}_${status}`,
          value: 1,
          unit: 'count',
        });

        return duration;
      };
    },
    [actionName]
  );

  return { startActionTimer };
}
