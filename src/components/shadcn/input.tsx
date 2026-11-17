import * as React from "react"

import { cn } from "@potta/lib/utils"

/** Talk-aligned underline input used across Potta forms and table search. */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          "flex h-10 w-full min-w-0 rounded-t-[2px] rounded-b-none border-0 border-b border-black/15 bg-zinc-50 px-3 py-1.5 text-sm font-normal leading-none text-foreground shadow-none outline-none transition-colors",
          "placeholder:text-black/35 selection:bg-primary selection:text-primary-foreground",
          "focus-visible:border-primary focus-visible:ring-0",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-destructive",
          "file:mr-3 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
