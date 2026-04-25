/**
 * Utility functions for consistent table behavior across the application
 */

export const TABLE_DEFAULTS = {
  pageSize: 10,
  pageSizeOptions: [5, 10, 20, 50, 100],
  minHeight: 400,
  padding: 15,
} as const;

/**
 * Calculate optimal table height based on viewport and element position
 */
export const calculateTableHeight = (
  elementRef: HTMLElement | null,
  minHeight: number = TABLE_DEFAULTS.minHeight,
  padding: number = TABLE_DEFAULTS.padding
): number => {
  if (typeof window === 'undefined' || !elementRef) {
    return 600; // Fallback height
  }

  const elementRect = elementRef.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const elementTop = elementRect.top;
  const calculatedHeight = viewportHeight - elementTop - padding;

  return Math.max(calculatedHeight, minHeight);
};

/**
 * Debounced height calculation to prevent excessive updates
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Setup table height calculation with proper event listeners
 */
export const setupTableHeightCalculation = (
  elementRef: HTMLElement | null,
  setHeight: (height: number) => void,
  options: {
    minHeight?: number;
    padding?: number;
    debounceMs?: number;
  } = {}
) => {
  const {
    minHeight = TABLE_DEFAULTS.minHeight,
    padding = TABLE_DEFAULTS.padding,
    debounceMs = 50,
  } = options;

  const calculateHeight = () => {
    const height = calculateTableHeight(elementRef, minHeight, padding);
    setHeight(height);
  };

  const debouncedCalculateHeight = debounce(calculateHeight, debounceMs);

  // Initial calculation with delay
  const initialTimeout = setTimeout(calculateHeight, 100);

  // Setup ResizeObserver
  let resizeObserver: ResizeObserver | null = null;
  if (elementRef && window.ResizeObserver) {
    resizeObserver = new ResizeObserver(debouncedCalculateHeight);
    resizeObserver.observe(elementRef);
  }

  // Setup event listeners
  window.addEventListener('resize', debouncedCalculateHeight);

  const handleVisibilityChange = () => {
    if (!document.hidden) {
      setTimeout(calculateHeight, 100);
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Cleanup function
  return () => {
    clearTimeout(initialTimeout);
    window.removeEventListener('resize', debouncedCalculateHeight);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  };
};

/**
 * Get consistent table container classes
 */
export const getTableContainerClasses = (
  showHeight: boolean = false
): string => {
  const baseClasses = 'flex flex-col data-grid-container';
  return showHeight ? `${baseClasses} h-full` : baseClasses;
};

/**
 * Get consistent table container styles
 */
export const getTableContainerStyles = (
  availableHeight: number,
  showHeight: boolean = false,
  maxHeight?: string
): React.CSSProperties => {
  return {
    height: showHeight ? '100%' : maxHeight || `${availableHeight}px`,
    maxHeight: showHeight ? '100%' : maxHeight || `${availableHeight}px`,
    minHeight: 0,
    overflow: 'hidden',
  };
};

