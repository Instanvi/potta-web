import * as React from "react"

import { cn } from "@potta/lib/utils"
import { FIELD_TEXTAREA } from "@/lib/field-styles"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(FIELD_TEXTAREA, className)}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
