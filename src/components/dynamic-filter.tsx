import React from 'react';
import Search from './search';
import CustomSelect from '@potta/app/(routes)/account_receivables/invoice/components/CustomSelect';
import SearchableSelect from './searchableSelect';
import { cn } from '@potta/lib/utils';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterConfig {
  key: string;
  label?: string;
  icon?: React.ReactNode;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  selectClassName?: string;
  isSearchable?: boolean;
  loadOptions?: (inputValue: string) => Promise<FilterOption[]>;
  minInputLength?: number;
}

interface DynamicFilterProps {
  searchValue?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchClear?: () => void;
  searchPlaceholder?: string;
  filters: FilterConfig[];
  className?: string;
  /** Stack controls vertically (narrow side panels). Default is row on md+. */
  orientation?: 'row' | 'stack';
}

const DynamicFilter: React.FC<DynamicFilterProps> = ({
  searchValue,
  onSearchChange,
  onSearchClear,
  searchPlaceholder = 'Search...',
  filters,
  className = '',
  orientation = 'row',
}) => {
  const stacked = orientation === 'stack';

  return (
    <div
      className={cn(
        'flex p-4 px-0',
        stacked ? 'flex-col gap-2' : 'flex-row flex-wrap items-center gap-3',
        className
      )}
    >
      <div
        className={cn(
          'flex min-w-0 flex-1',
          stacked ? 'flex-col gap-2' : 'flex-row flex-wrap items-center gap-3'
        )}
      >
        {onSearchChange && (
          <div className={cn(stacked ? 'w-full' : 'min-w-[16rem] max-w-md flex-1')}>
            <Search
              placeholder={searchPlaceholder}
              value={searchValue}
              className="bg-field"
              onChange={onSearchChange}
              onClear={onSearchClear}
            />
          </div>
        )}
        {filters.map((filter) => (
          <div
            key={filter.key}
            className={cn(
              'flex items-center gap-2',
              stacked ? 'w-full' : 'shrink-0'
            )}
          >
            {filter.icon}
            {filter.isSearchable ? (
              <SearchableSelect
                options={filter.options}
                selectedValue={filter.value}
                onChange={filter.onChange}
                placeholder={filter.label}
                className={cn(filter.selectClassName, stacked && 'w-full')}
                loadOptions={filter.loadOptions}
                minInputLength={filter.minInputLength}
              />
            ) : (
              <CustomSelect
                options={filter.options}
                value={filter.value}
                onChange={(value) => filter.onChange(value || '')}
                placeholder={filter.label}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DynamicFilter;
