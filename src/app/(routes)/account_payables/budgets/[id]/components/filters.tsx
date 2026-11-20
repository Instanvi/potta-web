'use client';
import Button from '@potta/components/button';
import Search from '@potta/components/search';
import Select from '@potta/components/select';
import React from 'react';

export interface BudgetFilterProps {
  search: string;
  setSearch: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  dateRange: string;
  setDateRange: (v: string) => void;
}

const Filter: React.FC<BudgetFilterProps> = ({
  search,
  setSearch,
  status,
  setStatus,
  dateRange,
  setDateRange,
}) => {
  return (
    <div className="w-full flex flex-col md:flex-row justify-between gap-4 mt-6">
      <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3">
        <div className="w-full md:w-1/3">
          <Search
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-[20%] ">
          <label className="text-sm font-medium whitespace-nowrap">
            Filter:
          </label>
          <Select
            options={[
              { label: 'All', value: 'all' },
              { label: 'Pending', value: 'pending' },
              { label: 'Completed', value: 'completed' },
              { label: 'Failed', value: 'failed' },
            ]}
            selectedValue={status}
            onChange={setStatus}
            bg=''
          />
        </div>

        <div className="flex items-center gap-2 w-[20%]">
          <label className="text-sm font-medium whitespace-nowrap">Date:</label>
          <Select
            options={[
              { label: 'All Time', value: 'All Time' },
              { label: 'Yesterday', value: 'Yesterday' },
              { label: 'Last 7 Days', value: 'Last 7 Days' },
              { label: 'Last 30 Days', value: 'Last 30 Days' },
            ]}
            selectedValue={dateRange}
            onChange={setDateRange}
            bg=""
          />
        </div>
      </div>

      <div className="flex items-center justify-end w-full md:w-auto">
        <Button
          type="button"
          color
          text="Export"
          icon={<img src="/images/export.svg" alt="Export" />}
          theme="lightBlue"
          className="h-[47px]"
        />
      </div>
    </div>
  );
};

export default Filter;
