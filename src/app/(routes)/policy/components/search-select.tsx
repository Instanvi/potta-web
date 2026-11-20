'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@potta/components/shadcn/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@potta/components/shadcn/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@potta/components/shadcn/popover';
import { Check, X, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Badge } from '@potta/components/shadcn/badge';
import { ScrollArea } from '@potta/components/shadcn/scroll-area';
import { cn } from '@potta/lib/utils';

interface Item {
  id: string;
  name: string;
}

interface SearchSelectProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  isMultiSelect: boolean;
  onSearch: (query: string) => void;
  items: Item[];
  isLoading: boolean;
  placeholder: string;
  emptyMessage: string;
}

export const SearchSelect: React.FC<SearchSelectProps> = ({
  value,
  onChange,
  isMultiSelect,
  onSearch,
  items,
  isLoading,
  placeholder,
  emptyMessage,
}) => {
  // State
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);

  // Effect to update selected items when value changes
  useEffect(() => {
    if (isMultiSelect && Array.isArray(value)) {
      const selected = items.filter((item) => value.includes(item.id));
      setSelectedItems(selected);
    } else if (!isMultiSelect && typeof value === 'string' && value) {
      const selected = items.find((item) => item.id === value);
      if (selected) {
        setSelectedItems([selected]);
      } else {
        setSelectedItems([]);
      }
    } else {
      setSelectedItems([]);
    }
  }, [value, items, isMultiSelect]);

  // Handle search query change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  // Handle item selection
  const handleSelect = (itemId: string) => {
    if (isMultiSelect) {
      // For multi-select, toggle selection
      const newValue = Array.isArray(value) ? [...value] : [];
      const index = newValue.indexOf(itemId);

      if (index === -1) {
        // Add item
        newValue.push(itemId);
      } else {
        // Remove item
        newValue.splice(index, 1);
      }

      onChange(newValue);
    } else {
      // For single select
      onChange(itemId);
      setOpen(false);
    }
  };

  // Remove an item
  const removeItem = (itemId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (isMultiSelect && Array.isArray(value)) {
      onChange(value.filter((id) => id !== itemId));
    } else {
      onChange('');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'justify-between w-full text-left font-normal',
            selectedItems.length > 0 ? 'h-auto' : ''
          )}
        >
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : selectedItems.length > 0 ? (
            <div className="flex flex-wrap gap-1 py-1">
              {selectedItems.map((item) => (
                <Badge
                  key={item.id}
                  className="flex items-center gap-1"
                  variant="secondary"
                >
                  {item.name}
                  <button
                    type="button"
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={(e) => removeItem(item.id, e)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <span>{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]">
        <Command>
          <CommandInput
            placeholder={placeholder}
            onValueChange={handleSearchChange}
            className="h-9"
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup>
            <ScrollArea className="h-[200px]">
              {items.map((item) => {
                const isSelected = isMultiSelect
                  ? Array.isArray(value) && value.includes(item.id)
                  : value === item.id;

                return (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleSelect(item.id)}
                  >
                    {item.name}
                    {isSelected && <Check className="ml-auto h-4 w-4" />}
                  </CommandItem>
                );
              })}
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
