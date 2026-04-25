'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronsUpDown, Search, Check } from 'lucide-react';
import { Button } from '@potta/components/shadcn/button';
import { Badge } from '@potta/components/shadcn/badge';
import { Input } from '@potta/components/shadcn/input';
import { ScrollArea } from '@potta/components/shadcn/scroll-area';
import { useSearchCustomers } from '../hooks/policyHooks';
import { cn } from '@potta/lib/utils';

// Normalized customer interface for our component
interface CustomerObject {
  uuid: string;
  name: string;
}

type CustomerValue = CustomerObject | CustomerObject[] | null;

interface CustomerSelectProps {
  value: CustomerValue;
  onChange: (value: CustomerValue) => void;
  isMultiSelect?: boolean;
  placeholder?: string;
}

export const CustomerSelect: React.FC<CustomerSelectProps> = ({
  value,
  onChange,
  isMultiSelect = false,
  placeholder = 'Select customer...',
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<
    Array<CustomerObject>
  >([]);

  // Use the search hook to fetch customers
  const { data: rawCustomersData, isLoading } = useSearchCustomers(searchQuery);

  // Transform the raw customer data to our normalized format
  const customers = useMemo(() => {
    if (!rawCustomersData) return [];

    // Handle both array and object responses
    const dataArray = Array.isArray(rawCustomersData)
      ? rawCustomersData
      : [rawCustomersData];

    return dataArray.map((customer) => ({
      uuid: customer.uuid || customer.id, // Map uuid to id, fallback to id if exists
      name:
        customer.name ||
        `${customer.firstName || ''} ${customer.lastName || ''}`.trim(), // Handle different data structures
    }));
  }, [rawCustomersData]);

  // Filter out already selected customers from the list for multi-select
  const filteredCustomers = useMemo(() => {
    if (!isMultiSelect || !value || !Array.isArray(value)) {
      return customers;
    }

    // Filter out customers that are already selected
    const selectedIds = value.map((customer) => customer.uuid);
    return customers.filter((customer) => !selectedIds.includes(customer.uuid));
  }, [customers, value, isMultiSelect]);

  // Effect to handle initial value loading and changes to value from parent
  useEffect(() => {
    // For multi-select, value is an array of customer objects
    if (isMultiSelect && Array.isArray(value) && value.length > 0) {
      setSelectedCustomers(value);
    }
    // For single select, value is just a customer object
    else if (!isMultiSelect && value && !Array.isArray(value)) {
      setSelectedCustomers([value]);
    } else {
      // Reset when value is empty
      setSelectedCustomers([]);
    }
  }, [value, isMultiSelect]);

  // Format display value for trigger button
  const getDisplayValue = () => {
    if (isMultiSelect) {
      return selectedCustomers.length > 0
        ? `${selectedCustomers.length} customer${
            selectedCustomers.length > 1 ? 's' : ''
          } selected`
        : placeholder;
    } else {
      return selectedCustomers.length > 0
        ? selectedCustomers[0].name
        : placeholder;
    }
  };

  // Handle selecting a customer
  const handleSelect = (customer: CustomerObject) => {
    if (isMultiSelect) {
      // For multi-select, add to array if not already present
      if (Array.isArray(value)) {
        const isAlreadySelected = value.some((c) => c.uuid === customer.uuid);
        const newValue = isAlreadySelected
          ? value.filter((c) => c.uuid !== customer.uuid) // remove if already selected
          : [...value, customer]; // add if not selected
        onChange(newValue);
      } else {
        // Convert single value to array
        onChange([customer]);
      }
    } else {
      // For single select, just set the value
      onChange(customer);
      setOpen(false);
    }
  };

  // Remove a customer from selection
  const handleRemove = (customerId: string) => {
    if (isMultiSelect && Array.isArray(value)) {
      onChange(value.filter((customer) => customer.uuid !== customerId));
    } else {
      onChange(null);
    }
  };

  // Check if a customer is selected
  const isCustomerSelected = (customerId: string): boolean => {
    if (isMultiSelect && Array.isArray(value)) {
      return value.some((customer) => customer.uuid === customerId);
    } else if (!isMultiSelect && value && !Array.isArray(value)) {
      return value.uuid === customerId;
    }
    return false;
  };

  // Close dropdown if user clicks outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('.customer-select-dropdown') &&
        !target.closest('.customer-select-button')
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full">
      <div className="relative">
        {/* Button to open dropdown */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 justify-between customer-select-button"
          onClick={() => setOpen(!open)}
        >
          <span className="truncate flex-1 text-left">{getDisplayValue()}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        {/* Custom dropdown */}
        {open && (
          <div className="absolute z-50 w-full bg-white border mt-1 shadow-sm customer-select-dropdown">
            {/* Search input with icon */}
            <div className="p-2 border-b relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers..."
                className="pl-8 h-8"
              />
            </div>

            {/* Selected customers section (only for multi-select) */}
            {isMultiSelect && selectedCustomers.length > 0 && (
              <div className="border-b p-2 bg-gray-50">
                <p className="text-sm text-gray-500 mb-1">
                  Selected customers:
                </p>
                <ScrollArea className="max-h-24">
                  <div className="flex flex-wrap gap-1">
                    {selectedCustomers.map((customer) => (
                      <Badge
                        key={customer.uuid}
                        className="flex items-center gap-1"
                        variant="secondary"
                      >
                        {customer.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => handleRemove(customer.uuid)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Search results */}
            <div className="max-h-60 overflow-auto">
              {isLoading ? (
                <div className="py-4 px-4 text-sm text-center">
                  <div className="animate-pulse flex justify-center">
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                  </div>
                </div>
              ) : filteredCustomers.length > 0 ? (
                <div>
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.uuid}
                      onClick={() => handleSelect(customer)}
                      className={cn(
                        'px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 flex items-center justify-between',
                        isCustomerSelected(customer.uuid) ? 'bg-slate-100' : ''
                      )}
                    >
                      <span className="truncate">{customer.name}</span>
                      {isCustomerSelected(customer.uuid) && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 px-4 text-sm text-center text-gray-500">
                  {isMultiSelect &&
                  Array.isArray(value) &&
                  value.length > 0 &&
                  customers.length > 0
                    ? 'All customers are selected'
                    : searchQuery
                    ? 'No customers found with that name'
                    : 'No customers available'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
