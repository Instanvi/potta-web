'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronsUpDown, Search, Check } from 'lucide-react';
import { Button } from '@potta/components/shadcn/button';
import { Badge } from '@potta/components/shadcn/badge';
import { Input } from '@potta/components/shadcn/input';
import { ScrollArea } from '@potta/components/shadcn/scroll-area';
import { useSearchVendors } from '../hooks/policyHooks';
import { cn } from '@potta/lib/utils';

// Normalized vendor interface for our component
interface VendorObject {
  id: string;
  name: string;
}

type VendorValue = VendorObject | VendorObject[] | null;

interface VendorSelectProps {
  value: VendorValue;
  onChange: (value: VendorValue) => void;
  isMultiSelect?: boolean;
  placeholder?: string;
}

export const VendorSelect: React.FC<VendorSelectProps> = ({
  value,
  onChange,
  isMultiSelect = false,
  placeholder = 'Select vendor...',
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendors, setSelectedVendors] = useState<Array<VendorObject>>(
    []
  );

  // Use the search hook to fetch vendors
  const { data: rawVendorsData, isLoading } = useSearchVendors(searchQuery);

  // Transform the raw vendor data to our normalized format
  const vendors = useMemo(() => {
    if (!rawVendorsData) return [];

    // Handle both array and object responses
    const dataArray = Array.isArray(rawVendorsData)
      ? rawVendorsData
      : [rawVendorsData];

    return dataArray.map((vendor) => ({
      id: vendor.uuid || vendor.id, // Map uuid to id, fallback to id if exists
      name:
        vendor.name ||
        `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim(), // Handle different data structures
    }));
  }, [rawVendorsData]);

  // Filter out already selected vendors from the list for multi-select
  const filteredVendors = useMemo(() => {
    if (!isMultiSelect || !value || !Array.isArray(value)) {
      return vendors;
    }

    // Filter out vendors that are already selected
    const selectedIds = value.map((vendor) => vendor.id);
    return vendors.filter((vendor) => !selectedIds.includes(vendor.id));
  }, [vendors, value, isMultiSelect]);

  // Effect to handle initial value loading and changes to value from parent
  useEffect(() => {
    // For multi-select, value is an array of vendor objects
    if (isMultiSelect && Array.isArray(value) && value.length > 0) {
      setSelectedVendors(value);
    }
    // For single select, value is just a vendor object
    else if (!isMultiSelect && value && !Array.isArray(value)) {
      setSelectedVendors([value]);
    } else {
      // Reset when value is empty
      setSelectedVendors([]);
    }
  }, [value, isMultiSelect]);

  // Format display value for trigger button
  const getDisplayValue = () => {
    if (isMultiSelect) {
      return selectedVendors.length > 0
        ? `${selectedVendors.length} vendor${
            selectedVendors.length > 1 ? 's' : ''
          } selected`
        : placeholder;
    } else {
      return selectedVendors.length > 0 ? selectedVendors[0].name : placeholder;
    }
  };

  // Handle selecting a vendor
  const handleSelect = (vendor: VendorObject) => {
    if (isMultiSelect) {
      // For multi-select, add to array if not already present
      if (Array.isArray(value)) {
        const isAlreadySelected = value.some((v) => v.id === vendor.id);
        const newValue = isAlreadySelected
          ? value.filter((v) => v.id !== vendor.id) // remove if already selected
          : [...value, vendor]; // add if not selected
        onChange(newValue);
      } else {
        // Convert single value to array
        onChange([vendor]);
      }
    } else {
      // For single select, just set the value
      onChange(vendor);
      setOpen(false);
    }
  };

  // Remove a vendor from selection
  const handleRemove = (vendorId: string) => {
    if (isMultiSelect && Array.isArray(value)) {
      onChange(value.filter((vendor) => vendor.id !== vendorId));
    } else {
      onChange(null);
    }
  };

  // Check if a vendor is selected
  const isVendorSelected = (vendorId: string): boolean => {
    if (isMultiSelect && Array.isArray(value)) {
      return value.some((vendor) => vendor.id === vendorId);
    } else if (!isMultiSelect && value && !Array.isArray(value)) {
      return value.id === vendorId;
    }
    return false;
  };

  // Close dropdown if user clicks outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('.vendor-select-dropdown') &&
        !target.closest('.vendor-select-button')
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
          className="w-full h-12 justify-between vendor-select-button"
          onClick={() => setOpen(!open)}
        >
          <span className="truncate flex-1 text-left">{getDisplayValue()}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        {/* Custom dropdown */}
        {open && (
          <div className="absolute z-50 w-full bg-white border mt-1 shadow-sm vendor-select-dropdown">
            {/* Search input with icon */}
            <div className="p-2 border-b relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendors..."
                className="pl-8 h-8"
              />
            </div>

            {/* Selected vendors section (only for multi-select) */}
            {isMultiSelect && selectedVendors.length > 0 && (
              <div className="border-b p-2 bg-gray-50">
                <p className="text-sm text-gray-500 mb-1">Selected vendors:</p>
                <ScrollArea className="max-h-24">
                  <div className="flex flex-wrap gap-1">
                    {selectedVendors.map((vendor) => (
                      <Badge
                        key={vendor.id}
                        className="flex items-center gap-1"
                        variant="secondary"
                      >
                        {vendor.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => handleRemove(vendor.id)}
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
              ) : filteredVendors.length > 0 ? (
                <div>
                  {filteredVendors.map((vendor) => (
                    <div
                      key={vendor.id}
                      onClick={() => handleSelect(vendor)}
                      className={cn(
                        'px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 flex items-center justify-between',
                        isVendorSelected(vendor.id) ? 'bg-slate-100' : ''
                      )}
                    >
                      <span className="truncate">{vendor.name}</span>
                      {isVendorSelected(vendor.id) && (
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
                  vendors.length > 0
                    ? 'All vendors are selected'
                    : searchQuery
                    ? 'No vendors found with that name'
                    : 'No vendors available'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
