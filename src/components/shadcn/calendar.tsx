"use client"

import * as React from "react"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@potta/lib/utils"
import { buttonVariants } from "./button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",
        caption: "relative flex items-center justify-center pt-1",
        caption_label: "inline-flex items-center gap-1 text-sm font-medium",
        caption_dropdowns: "flex items-center gap-2",
        dropdown_month: "relative inline-flex items-center rounded-[2px] border border-input px-2 py-1 hover:bg-accent",
        dropdown_year: "relative inline-flex items-center rounded-[2px] border border-input px-2 py-1 hover:bg-accent",
        dropdown: "absolute inset-0 z-10 w-full cursor-pointer appearance-none opacity-0",
        dropdown_icon: "h-3.5 w-3.5 opacity-60",
        vhidden: "hidden",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: "w-9 text-[0.8rem] font-normal text-muted-foreground",
        row: "mt-1 flex w-full",
        cell: cn(
          "relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-brand-subtle [&:has([aria-selected].day-outside)]:bg-brand-subtle/50",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-[2px] [&:has(>.day-range-start)]:rounded-l-[2px] first:[&:has([aria-selected])]:rounded-l-[2px] last:[&:has([aria-selected])]:rounded-r-[2px]"
            : "[&:has([aria-selected])]:rounded-[2px]"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "border border-primary/40 text-primary",
        day_outside:
          "day-outside text-muted-foreground opacity-60 aria-selected:bg-brand-subtle/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-40",
        day_range_middle:
          "aria-selected:bg-brand-subtle aria-selected:text-primary",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
        IconDropdown: ({ className, ...props }) => (
          <ChevronDown className={cn("h-3.5 w-3.5 opacity-60", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
