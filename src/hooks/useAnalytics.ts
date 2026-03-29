import { useState, useEffect, useCallback } from 'react';
import {
  pottaAnalyticsService,
  AnalyticsResponse,
  TrendsResponse,
  ComparisonResponse,
  AnalyticsOptions,
  TrendsOptions,
  ComparisonOptions,
  FactTable,
} from '../services/analyticsService';

// Hook for fetching analytics data
interface UseAnalyticsOptions extends AnalyticsOptions {
  factName: string;
  autoFetch?: boolean;
}

interface UseAnalyticsReturn {
  data: AnalyticsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAnalytics = (
  options: UseAnalyticsOptions
): UseAnalyticsReturn => {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await pottaAnalyticsService.getAnalytics(
        options.factName,
        {
          metrics: options.metrics,
          dimensions: options.dimensions,
          time_granularity: options.time_granularity,
          start_date: options.start_date,
          end_date: options.end_date,
          location_id: options.location_id,
          organization_id: options.organization_id,
          account_uuid: options.account_uuid,
          product_uuid: options.product_uuid,
          customer_uuid: options.customer_uuid,
          vendor_uuid: options.vendor_uuid,
          use_mock_data: options.use_mock_data ?? true,
        }
      );

      setData(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch analytics data';
      setError(errorMessage);
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchData();
    }
  }, [fetchData, options.autoFetch]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

// Hook for fetching trends
interface UseTrendsOptions extends TrendsOptions {
  factName: string;
  autoFetch?: boolean;
}

interface UseTrendsReturn {
  data: TrendsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTrends = (options: UseTrendsOptions): UseTrendsReturn => {
  const [data, setData] = useState<TrendsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await pottaAnalyticsService.getTrends(options.factName, {
        metric: options.metric,
        time_granularity: options.time_granularity,
        periods: options.periods,
      });

      setData(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch trends data';
      setError(errorMessage);
      console.error('Trends fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchData();
    }
  }, [fetchData, options.autoFetch]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

// Hook for fetching comparisons
interface UseComparisonOptions extends ComparisonOptions {
  factName: string;
  autoFetch?: boolean;
}

interface UseComparisonReturn {
  data: ComparisonResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useComparison = (
  options: UseComparisonOptions
): UseComparisonReturn => {
  const [data, setData] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await pottaAnalyticsService.getComparison(
        options.factName,
        {
          metric: options.metric,
          compare_by: options.compare_by,
        }
      );

      setData(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch comparison data';
      setError(errorMessage);
      console.error('Comparison fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchData();
    }
  }, [fetchData, options.autoFetch]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

// Hook for fetching available facts
interface UseAvailableFactsReturn {
  data: Record<string, FactTable[]> | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAvailableFacts = (): UseAvailableFactsReturn => {
  const [data, setData] = useState<Record<string, FactTable[]> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await pottaAnalyticsService.getAvailableFacts();
      setData(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch available facts';
      setError(errorMessage);
      console.error('Available facts fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

// Hook for fetching available dimensions
interface UseAvailableDimensionsOptions {
  fact?: string;
  autoFetch?: boolean;
}

interface UseAvailableDimensionsReturn {
  data: string[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAvailableDimensions = (
  options: UseAvailableDimensionsOptions = {}
): UseAvailableDimensionsReturn => {
  const [data, setData] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await pottaAnalyticsService.getAvailableDimensions(
        options.fact
      );
      setData(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch available dimensions';
      setError(errorMessage);
      console.error('Available dimensions fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [options.fact]);

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchData();
    }
  }, [fetchData, options.autoFetch]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

// Specialized hooks for common use cases
export const useRevenueData = (
  timeGranularity:
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'quarterly'
    | 'yearly' = 'monthly'
) => {
  return useAnalytics({
    factName: 'revenue',
    metrics: ['total_revenue'],
    dimensions: ['time'],
    time_granularity: timeGranularity,
    use_mock_data: true,
  });
};

export const useExpenseData = (
  timeGranularity:
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'quarterly'
    | 'yearly' = 'monthly'
) => {
  return useAnalytics({
    factName: 'expenses',
    metrics: ['total_expenses'],
    dimensions: ['time'],
    time_granularity: timeGranularity,
    use_mock_data: true,
  });
};

export const useCustomerData = (
  timeGranularity:
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'quarterly'
    | 'yearly' = 'monthly'
) => {
  return useAnalytics({
    factName: 'customers',
    metrics: ['customer_count'],
    dimensions: ['time'],
    time_granularity: timeGranularity,
    use_mock_data: true,
  });
};

export const useOrderData = (
  timeGranularity:
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'quarterly'
    | 'yearly' = 'monthly'
) => {
  return useAnalytics({
    factName: 'orders',
    metrics: ['order_count'],
    dimensions: ['time'],
    time_granularity: timeGranularity,
    use_mock_data: true,
  });
};

export const useProductData = (
  timeGranularity:
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'quarterly'
    | 'yearly' = 'monthly'
) => {
  return useAnalytics({
    factName: 'products',
    metrics: ['product_count'],
    dimensions: ['time'],
    time_granularity: timeGranularity,
    use_mock_data: true,
  });
};

export const usePaymentData = (
  timeGranularity:
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'quarterly'
    | 'yearly' = 'monthly'
) => {
  return useAnalytics({
    factName: 'payments',
    metrics: ['payment_amount'],
    dimensions: ['time'],
    time_granularity: timeGranularity,
    use_mock_data: true,
  });
};
