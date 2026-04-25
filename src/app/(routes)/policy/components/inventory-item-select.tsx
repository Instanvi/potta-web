'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronsUpDown, Search, Check } from 'lucide-react';
import { Button } from '@potta/components/shadcn/button';
import { Badge } from '@potta/components/shadcn/badge';
import { Input } from '@potta/components/shadcn/input';
import { ScrollArea } from '@potta/components/shadcn/scroll-area';
import { useSearchItems } from '../hooks/policyHooks';
import { cn } from '@potta/lib/utils';

// Normalized inventory item interface for our component
interface InventoryItemObject {
  id: string;
  name: string;
}

type InventoryItemValue = InventoryItemObject | InventoryItemObject[] | null;

interface InventoryItemSelectProps {
  value: InventoryItemValue;
  onChange: (value: InventoryItemValue) => void;
  isMultiSelect?: boolean;
  placeholder?: string;
}

export const InventoryItemSelect: React.FC<InventoryItemSelectProps> = ({
  value,
  onChange,
  isMultiSelect = false,
  placeholder = 'Select inventory item...',
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<
    Array<InventoryItemObject>
  >([]);

  // Use the search hook to fetch inventory items
  const { data: rawItemsData, isLoading } = useSearchItems(searchQuery);

  // Transform the raw item data to our normalized format
  const items = useMemo(() => {
    if (!rawItemsData) return [];

    // Handle both array and object responses
    const dataArray = Array.isArray(rawItemsData)
      ? rawItemsData
      : [rawItemsData];

    return dataArray.map((item) => ({
      id: item.uuid || item.id, // Map uuid to id, fallback to id if exists
      name: item.name || 'Unknown Item',
    }));
  }, [rawItemsData]);

  // Filter out already selected items from the list for multi-select
  const filteredItems = useMemo(() => {
    if (!isMultiSelect || !value || !Array.isArray(value)) {
      return items;
    }

    // Filter out items that are already selected
    const selectedIds = value.map((item) => item.id);
    return items.filter((item) => !selectedIds.includes(item.id));
  }, [items, value, isMultiSelect]);

  // Effect to handle initial value loading and changes to value from parent
  useEffect(() => {
    // For multi-select, value is an array of item objects
    if (isMultiSelect && Array.isArray(value) && value.length > 0) {
      setSelectedItems(value);
    }
    // For single select, value is just an item object
    else if (!isMultiSelect && value && !Array.isArray(value)) {
      setSelectedItems([value]);
    } else {
      // Reset when value is empty
      setSelectedItems([]);
    }
  }, [value, isMultiSelect]);

  // Format display value for trigger button
  const getDisplayValue = () => {
    if (isMultiSelect) {
      return selectedItems.length > 0
        ? `${selectedItems.length} item${
            selectedItems.length > 1 ? 's' : ''
          } selected`
        : placeholder;
    } else {
      return selectedItems.length > 0 ? selectedItems[0].name : placeholder;
    }
  };

  // Handle selecting an item
  const handleSelect = (item: InventoryItemObject) => {
    if (isMultiSelect) {
      // For multi-select, add to array if not already present
      if (Array.isArray(value)) {
        const isAlreadySelected = value.some((v) => v.id === item.id);
        const newValue = isAlreadySelected
          ? value.filter((v) => v.id !== item.id) // remove if already selected
          : [...value, item]; // add if not selected
        onChange(newValue);
      } else {
        // Convert single value to array
        onChange([item]);
      }
    } else {
      // For single select, just set the value
      onChange(item);
      setOpen(false);
    }
  };

  // Remove an item from selection
  const handleRemove = (itemId: string) => {
    if (isMultiSelect && Array.isArray(value)) {
      onChange(value.filter((item) => item.id !== itemId));
    } else {
      onChange(null);
    }
  };

  // Check if an item is selected
  const isItemSelected = (itemId: string): boolean => {
    if (isMultiSelect && Array.isArray(value)) {
      return value.some((item) => item.id === itemId);
    } else if (!isMultiSelect && value && !Array.isArray(value)) {
      return value.id === itemId;
    }
    return false;
  };

  // Close dropdown if user clicks outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('.item-select-dropdown') &&
        !target.closest('.item-select-button')
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
          className="w-full h-12 justify-between item-select-button"
          onClick={() => setOpen(!open)}
        >
          <span className="truncate flex-1 text-left">{getDisplayValue()}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        {/* Custom dropdown */}
        {open && (
          <div className="absolute z-50 w-full bg-white border mt-1 shadow-sm item-select-dropdown">
            {/* Search input with icon */}
            <div className="p-2 border-b relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search inventory items..."
                className="pl-8 h-8"
              />
            </div>

            {/* Selected items section (only for multi-select) */}
            {isMultiSelect && selectedItems.length > 0 && (
              <div className="border-b p-2 bg-gray-50">
                <p className="text-sm text-gray-500 mb-1">Selected items:</p>
                <ScrollArea className="max-h-24">
                  <div className="flex flex-wrap gap-1">
                    {selectedItems.map((item) => (
                      <Badge
                        key={item.id}
                        className="flex items-center gap-1"
                        variant="secondary"
                      >
                        {item.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => handleRemove(item.id)}
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
              ) : filteredItems.length > 0 ? (
                <div>
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={cn(
                        'px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 flex items-center justify-between',
                        isItemSelected(item.id) ? 'bg-slate-100' : ''
                      )}
                    >
                      <span className="truncate">{item.name}</span>
                      {isItemSelected(item.id) && (
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
                  items.length > 0
                    ? 'All items are selected'
                    : searchQuery
                    ? 'No inventory items found with that name'
                    : 'No inventory items available'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
