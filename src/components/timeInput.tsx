'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@potta/lib/utils';
import { Button } from '@potta/components/shadcn/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@potta/components/shadcn/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@potta/components/shadcn/select';
import { FieldError } from 'react-hook-form';

interface TimeInputProps {
  label?: string;
  placeholder?: string;
  name: string;
  className?: string;
  errors?: FieldError | string;
  required?: boolean;
  value?: string; // Format: "HH:MM" (24-hour format)
  onChange?: (time: string) => void;
  disabled?: boolean;
  format?: '12' | '24'; // 12-hour or 24-hour format
}

export function TimeInput({
  label,
  placeholder = 'Select time',
  name,
  className,
  errors,
  required = false,
  value,
  onChange,
  disabled = false,
  format = '24',
}: TimeInputProps) {
  const [open, setOpen] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Generate hours array based on format
  const hours =
    format === '12'
      ? Array.from({ length: 12 }, (_, i) =>
          (i + 1).toString().padStart(2, '0')
        )
      : Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

  // Generate minutes array (0-59)
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0')
  );

  // Parse current time value
  const parseTime = (timeString: string | undefined) => {
    if (!timeString) return { hour: '', minute: '', period: 'AM' };

    const [hour, minute] = timeString.split(':');

    if (format === '12') {
      const hourNum = parseInt(hour, 10);
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour =
        hourNum === 0
          ? '12'
          : hourNum > 12
          ? (hourNum - 12).toString().padStart(2, '0')
          : hour;
      return { hour: displayHour, minute, period };
    }

    return { hour, minute, period: 'AM' };
  };

  const { hour, minute, period } = parseTime(value);

  // Format time for display
  const formatTimeForDisplay = (timeString: string | undefined) => {
    if (!timeString) return null;

    const [hour, minute] = timeString.split(':');
    const hourNum = parseInt(hour, 10);

    if (format === '12') {
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour =
        hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
      return `${displayHour}:${minute} ${period}`;
    }

    return `${hour}:${minute}`;
  };

  // Handle time component changes
  const handleTimeChange = (
    type: 'hour' | 'minute' | 'period',
    selectedValue: string
  ) => {
    const currentTime = parseTime(value);

    let newHour = currentTime.hour;
    let newMinute = currentTime.minute;
    let newPeriod = currentTime.period;

    switch (type) {
      case 'hour':
        newHour = selectedValue;
        break;
      case 'minute':
        newMinute = selectedValue;
        break;
      case 'period':
        newPeriod = selectedValue;
        break;
    }

    // Convert to 24-hour format for storage
    let finalHour = newHour;
    if (format === '12') {
      const hourNum = parseInt(newHour, 10);
      if (newPeriod === 'PM' && hourNum !== 12) {
        finalHour = (hourNum + 12).toString().padStart(2, '0');
      } else if (newPeriod === 'AM' && hourNum === 12) {
        finalHour = '00';
      } else {
        finalHour = hourNum.toString().padStart(2, '0');
      }
    }

    const newTime = `${finalHour}:${newMinute}`;

    if (onChange) {
      onChange(newTime);
    }
  };

  // Prevent popover from closing when clicking inside
  const handlePopoverContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Handle popover open change with better control
  const handleOpenChange = (newOpen: boolean) => {
    // Only allow closing if we're not interacting with Select components
    if (!newOpen && selectOpen) {
      return; // Don't close if a Select dropdown is open
    }
    setOpen(newOpen);
  };

  // Monitor Select dropdown state
  useEffect(() => {
    const checkSelectState = () => {
      const activeSelect = document.querySelector(
        '[data-radix-select-content][data-state="open"]'
      );
      setSelectOpen(!!activeSelect);
    };

    // Check immediately
    checkSelectState();

    // Set up observer to watch for changes
    const observer = new MutationObserver(checkSelectState);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-state'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={className}>
      {label && (
        <span className="block mb-2 font-medium">
          {label}
          {required && <span className="text-red-500">*</span>}
        </span>
      )}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'w-full p-5 py-[22px] justify-start text-left font-normal',
              'border border-gray-300 rounded-[0px]',
              'hover:bg-transparent focus:ring-2 focus:ring-green-500 focus:border-green-500',
              !value && 'text-muted-foreground',
              disabled &&
                'bg-gray-100 opacity-60 pointer-events-none cursor-not-allowed',
              errors && 'border-red-500 focus:ring-red-500 focus:border-red-500'
            )}
            disabled={disabled}
          >
            <div className="flex items-center w-full justify-between">
              {value ? (
                formatTimeForDisplay(value)
              ) : (
                <span className="text-gray-300">{placeholder}</span>
              )}
              <Clock className="ml-2 text-gray-300 w-5 h-5" />
            </div>
          </Button>
        </PopoverTrigger>
        {!disabled && (
          <PopoverContent
            ref={popoverRef}
            className="w-auto p-0"
            align="start"
            onInteractOutside={(e) => {
              // Prevent closing when clicking on Select dropdowns or their content
              const target = e.target as Element;
              if (
                target.closest('[data-radix-select-content]') ||
                target.closest('[data-radix-select-viewport]') ||
                target.closest('[data-radix-select-item]') ||
                target.closest('[data-radix-select-trigger]') ||
                target.closest('[role="option"]') ||
                target.closest('[data-radix-popper-content-wrapper]') ||
                selectOpen
              ) {
                e.preventDefault();
                return;
              }
            }}
          >
            <div className="p-4 space-y-4" onClick={handlePopoverContentClick}>
              <div className="flex items-center gap-2">
                {/* Hour selector */}
                <div className="flex flex-col items-center">
                  <label className="text-sm font-medium mb-1">Hour</label>
                  <Select
                    value={hour}
                    onValueChange={(value) => handleTimeChange('hour', value)}
                  >
                    <SelectTrigger
                      className="w-[70px]"
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <SelectValue placeholder="HH" />
                    </SelectTrigger>
                    <SelectContent
                      className="max-h-[200px] overflow-y-auto"
                      side="bottom"
                    >
                      {hours.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <span className="text-2xl font-medium pt-6">:</span>

                {/* Minute selector */}
                <div className="flex flex-col items-center">
                  <label className="text-sm font-medium mb-1">Minute</label>
                  <Select
                    value={minute}
                    onValueChange={(value) => handleTimeChange('minute', value)}
                  >
                    <SelectTrigger
                      className="w-[70px]"
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent
                      className="max-h-[200px] overflow-y-auto"
                      side="bottom"
                    >
                      {minutes.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* AM/PM selector for 12-hour format */}
                {format === '12' && (
                  <div className="flex flex-col items-center">
                    <label className="text-sm font-medium mb-1">Period</label>
                    <Select
                      value={period}
                      onValueChange={(value) =>
                        handleTimeChange('period', value)
                      }
                    >
                      <SelectTrigger
                        className="w-[70px]"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <SelectValue placeholder="AM" />
                      </SelectTrigger>
                      <SelectContent side="bottom">
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Quick time presets */}
              <div className="border-t pt-3">
                <div className="text-sm font-medium mb-2">Quick Select</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '9:00 AM', value: '09:00' },
                    { label: '12:00 PM', value: '12:00' },
                    { label: '1:00 PM', value: '13:00' },
                    { label: '5:00 PM', value: '17:00' },
                  ].map((preset) => (
                    <Button
                      key={preset.value}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onChange) {
                          onChange(preset.value);
                        }
                        setOpen(false);
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        )}
      </Popover>
      {errors && (
        <small className="text-red-500">
          {typeof errors === 'string' ? errors : errors.message}
        </small>
      )}
    </div>
  );
}
 