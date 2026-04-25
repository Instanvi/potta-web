import { useQuery } from '@tanstack/react-query';
import { timesheetApi } from '../../utils/api';
import { Timesheet } from '../../people/utils/types';
import React from 'react';

interface DateRange {
  start: Date;
  end: Date;
}

export function useTimesheets(dateRange: DateRange) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['timesheets'],
    queryFn: async () => {
      try {
        const response = await timesheetApi.filterTimesheets({
          limit: 100,
          sortBy: ['createdAt:DESC'],
        });
        return response.data;
      } catch (err) {
        return { data: [] };
      }
    },
  });

  const filteredData = React.useMemo(() => {
    if (!data?.data) return [];
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return data.data.filter((t: Timesheet) => {
      const d = new Date(t.createdAt);
      return d >= start && d <= end;
    });
  }, [data, dateRange]);

  return { data: filteredData, isLoading, error };
}
