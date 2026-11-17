import * as React from "react"

import { cn } from "@potta/lib/utils"
import { FIELD_INPUT } from "@/lib/field-styles"

/** Talk-aligned underline input used across Potta forms and table search. */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(FIELD_INPUT, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
