import { useState, useEffect, useRef } from 'react';
import {
  setupTableHeightCalculation,
  TABLE_DEFAULTS,
} from '@potta/utils/tableUtils';

interface UseTableHeightOptions {
  maxHeight?: string;
  containerRef?: React.RefObject<HTMLElement>;
  minHeight?: number;
  padding?: number;
}

export const useTableHeight = ({
  maxHeight,
  containerRef,
  minHeight = TABLE_DEFAULTS.minHeight,
  padding = TABLE_DEFAULTS.padding,
}: UseTableHeightOptions = {}) => {
  const [availableHeight, setAvailableHeight] = useState<number>(600);
  const internalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    // If maxHeight is provided, don't calculate dynamic height
    if (maxHeight) {
      return;
    }

    // Use containerRef if provided, otherwise use internal ref
    const elementRef = containerRef?.current || internalRef.current;

    // Setup the height calculation with proper event listeners
    const cleanup = setupTableHeightCalculation(
      elementRef,
      setAvailableHeight,
      { minHeight, padding }
    );

    return cleanup;
  }, [maxHeight, containerRef, minHeight, padding]);

  return { availableHeight, internalRef };
};
