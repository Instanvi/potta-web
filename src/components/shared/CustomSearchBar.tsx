"use client";

import * as React from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { cn } from "@potta/lib/utils";

interface CustomSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CustomSearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: CustomSearchBarProps) {
  return (
    <div
      className={cn(
        "flex h-14 w-full items-center gap-3 border border-gray-200 bg-[#F5F5F5] px-4",
        className
      )}
    >
      <MagnifyingGlass size={20} className="text-gray-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-base text-gray-700 outline-none placeholder:text-gray-400"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-gray-400 hover:text-gray-700"
        >
          <X size={18} />
        </button>
      ) : null}
    </div>
  );
}
