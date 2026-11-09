"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@potta/lib/utils";
import { Button } from "@potta/components/shadcn/button";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out",
      className
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const sheetVariants = {
  right:
    "inset-y-0 right-0 h-full border-l bg-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
  left:
    "inset-y-0 left-0 h-full border-r bg-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
};

/** Every sheet is half the screen (full width on phones); applied last so callers' width classes can't override it. */
const SHEET_WIDTH = "!w-full !max-w-full overflow-y-auto rounded-none sm:!w-1/2 sm:!max-w-[50vw]";

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: "left" | "right";
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 p-6 shadow-lg transition ease-in-out",
        sheetVariants[side],
        className,
        SHEET_WIDTH
      )}
      {...props}
    >
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-[2px] opacity-70 hover:opacity-100">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
      {children}
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-left", className)} {...props} />
);

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-6 flex items-center justify-end gap-2", className)} {...props} />
);

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-base font-medium text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;

interface CustomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  heading: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  side?: "left" | "right";
  footer?: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
}

function CustomSheet({
  open,
  onOpenChange,
  heading,
  description,
  children,
  side = "right",
  footer,
  cancelText = "Cancel",
  confirmText = "Save",
  onCancel,
  onConfirm,
  confirmDisabled = false,
}: CustomSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>{heading}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>

        <div className="mt-6">{children}</div>

        <SheetFooter>
          {footer ?? (
            <>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  if (onCancel) {
                    onCancel();
                  } else {
                    onOpenChange(false);
                  }
                }}
              >
                {cancelText}
              </Button>
              <Button
                type="button"
                onClick={onConfirm}
                disabled={confirmDisabled}
              >
                {confirmText}
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  CustomSheet,
};
