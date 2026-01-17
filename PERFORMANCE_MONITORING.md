# Performance Monitoring Guide

This application includes comprehensive performance monitoring integrated with Sentry for tracking and analyzing application performance.

## Overview

The performance monitoring system tracks:
- **Web Vitals**: LCP, FID/INP, CLS, page load metrics
- **API Performance**: Call duration and success/error rates
- **Form Performance**: Submission timing and validation speed
- **Component Rendering**: Render duration and detection of slow renders
- **Data Loading**: Collection-specific load performance
- **Memory Usage**: JavaScript heap size tracking (development only)

## Automatic Initialization

Performance monitoring is automatically initialized when the application loads via the `PerformanceMonitoringProvider` component in the root layout (`app/layout.tsx`).

All Web Vitals and page load metrics are tracked automatically.

## Using Performance Monitoring

### 1. Track API Calls

```typescript
import { measureApiCall } from '@/lib/performance-monitoring';

// Basic API tracking
const clients = await measureApiCall('fetchClients', () =>
  supabase.from('clients').select('*')
);

// Or use the hook
import { useOperationTiming } from '@/hooks/usePerformanceMonitoring';

function ClientList() {
  const { measureAsync } = useOperationTiming('loadClients');

  useEffect(() => {
    const loadClients = async () => {
      const data = await measureAsync(() =>
        supabase.from('clients').select('*')
      );
      setClients(data);
    };
    loadClients();
  }, [measureAsync]);

  return <div>...</div>;
}
```

### 2. Track Form Submissions

```typescript
import { useFormTiming } from '@/hooks/usePerformanceMonitoring';

function ClientForm() {
  const { trackSubmit } = useFormTiming('clientCreation');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await trackSubmit(async () => {
        return await createClient(formData);
      });
      // Show success
    } catch (error) {
      // Handle error
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 3. Track Data Loading

```typescript
import { useDataLoadTiming } from '@/hooks/usePerformanceMonitoring';
import { startTimer } from '@/lib/performance-monitoring';

function TaskList() {
  const { recordDataLoad } = useDataLoadTiming('tasks');

  useEffect(() => {
    const stopTimer = startTimer('loadTasks');
    supabase
      .from('tasks')
      .select('*')
      .then((result) => {
        const duration = stopTimer();
        recordDataLoad(result.data?.length || 0, duration);
        setTasks(result.data);
      });
  }, [recordDataLoad]);

  return <div>...</div>;
}
```

### 4. Track Component Rendering

Use React's `Profiler` API with the performance monitoring hook:

```typescript
import React from 'react';
import { trackComponentRender } from '@/lib/performance-monitoring';

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number,
  interactions: Set<any>
) {
  trackComponentRender(id, phase, actualDuration, baseDuration);
}

export function App() {
  return (
    <React.Profiler name="ClientList" onRender={onRenderCallback}>
      <ClientList />
    </React.Profiler>
  );
}
```

### 5. Track User Actions

```typescript
import { useUserActionTiming } from '@/hooks/usePerformanceMonitoring';

function ClientCard({ clientId }) {
  const { startActionTimer } = useUserActionTiming('deleteClient');

  const handleDelete = async () => {
    const stopTimer = startActionTimer();
    try {
      await deleteClient(clientId);
      stopTimer('success');
      // Show success message
    } catch (error) {
      stopTimer('error');
      // Show error message
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

### 6. Custom Metrics

```typescript
import { recordMetric } from '@/lib/performance-monitoring';

// Record a custom metric
recordMetric({
  name: 'form_validation_time',
  value: 45,
  unit: 'ms',
  tags: {
    formName: 'clientCreation',
    fieldsValidated: '5',
  },
});
```

## Metrics Available

### Web Vitals
- `web_vital_lcp`: Largest Contentful Paint (milliseconds)
- `web_vital_fid`: First Input Delay (milliseconds)
- `web_vital_cls`: Cumulative Layout Shift (count)

### Page Load
- `page_ttfb`: Time to First Byte (milliseconds)
- `page_dom_loaded`: DOM Content Loaded (milliseconds)
- `page_load_time`: Full page load time (milliseconds)

### API Operations
- `api_<operation>`: API call duration (milliseconds)
- `api_<operation>_success`: Successful API call count
- `api_<operation>_error`: Failed API call count

### Forms
- `form_<formName>_submit`: Form submission duration (milliseconds)
- `form_<formName>_success`: Successful submission count
- `form_<formName>_error`: Failed submission count

### Data Loading
- `data_load_<collection>`: Collection load duration (milliseconds)
- `data_fetch_<collection>`: Data fetch with record count (milliseconds)

### Components
- `component_<name>_mount`: Component mount duration (milliseconds)
- `component_<name>_update`: Component update duration (milliseconds)
- `component_rapid_rerender`: Rapid re-render detection (count)
- `component_slow_render`: Components taking >1000ms to render (milliseconds)

### Memory (Development Only)
- `memory_used_bytes`: Used JavaScript heap size (bytes)
- `memory_limit_bytes`: JavaScript heap size limit (bytes)

### User Actions
- `user_action_<action>_success`: Successful user action count
- `user_action_<action>_error`: Failed user action count

## Viewing Metrics in Sentry

All metrics are automatically sent to Sentry:

1. Open [Sentry Dashboard](https://sentry.io)
2. Navigate to your project
3. Go to **Performance** → **Metrics** to see performance data
4. Use tags to filter metrics (e.g., `formName:clientCreation`)

## Development vs Production

### Development
- Metrics are logged to browser console with `[METRIC]` prefix
- Memory metrics are tracked every 30 seconds
- All Web Vitals are captured
- Helpful for debugging performance issues

### Production
- Metrics are sent directly to Sentry
- No console logging
- Memory tracking is disabled to reduce overhead
- Web Vitals are tracked for monitoring production performance

## Performance Thresholds

The system automatically alerts on performance issues:

- **Slow Component Renders**: Any component taking >1000ms to render
- **Rapid Re-renders**: Components re-rendering in <100ms intervals
- **API Timeouts**: Long-running API calls (tracked in Sentry)

## Best Practices

### 1. Measure Critical Paths
Focus on tracking operations that directly impact user experience:
- API calls that block page interaction
- Form submissions
- Data loading for lists
- User interactions

### 2. Use Meaningful Names
```typescript
// Good
startTimer('fetch_clients_by_coach');
startTimer('client_creation_form_submit');

// Avoid
startTimer('load_data');
startTimer('do_stuff');
```

### 3. Include Tags for Filtering
```typescript
recordMetric({
  name: 'form_submit',
  value: 150,
  unit: 'ms',
  tags: {
    formName: 'clientCreation',
    fieldCount: '8',
    hasValidationErrors: 'false',
  },
});
```

### 4. Don't Over-Instrument
Track important operations, not every operation. Too many metrics can:
- Increase network overhead
- Make Sentry dashboard cluttered
- Impact performance

### 5. Monitor from Production
Use Sentry to identify real-world performance issues:
- Set performance thresholds in Sentry alerts
- Review slow transactions regularly
- Follow up on users experiencing poor performance

## Troubleshooting

### Metrics not appearing in Sentry
1. Verify Sentry is initialized (check browser console)
2. Check that `NODE_ENV` is not 'development' (for production check)
3. Ensure network requests to Sentry are not blocked
4. Check browser console for errors

### Memory metrics not tracking
- Memory API requires Chrome/Edge with specific flags
- Not available in all browsers by design
- Safe to ignore in Firefox/Safari

### High memory usage alerts
- Normal during initial app load
- Monitor over time for trends
- Check for memory leaks in components

## Integrating with Sentry

Metrics integrate automatically with Sentry's existing error tracking:

1. Each metric is tagged with its type
2. Metrics appear in transaction details
3. Use Sentry alerts to notify on thresholds
4. Correlate metrics with error tracking

For more information, see:
- [BUNDLE_OPTIMIZATION_GUIDE.md](./BUNDLE_OPTIMIZATION_GUIDE.md)
- [error-monitoring.ts](./lib/error-monitoring.ts) - Error tracking setup
- [Sentry Documentation](https://docs.sentry.io/product/metrics/)
