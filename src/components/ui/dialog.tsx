import * as React from "react";
import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { Button } from "@/components/ui/button";
import { useScrollIndicator } from "@/hooks/useScrollIndicator";
import { cn } from "@/lib/utils";

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "bg-foreground/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 print:hidden",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  header,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
  /** Sits in the top band, on the same line as the close control, above the scrolling body. */
  header?: React.ReactNode;
}) {
  const { bodyRef, trackRef, thumbRef } = useScrollIndicator();
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 flex w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] flex-col gap-4 overflow-hidden rounded-lg border p-6 shadow-lg duration-200 outline-none sm:max-w-lg print:hidden",
          showCloseButton && header == null && "pt-14",
          header != null && "pt-16",
          showCloseButton && "pr-4",
          className,
        )}
        {...props}
      >
        {header != null ? (
          <>
            <div className={cn("absolute top-2 right-16 left-6 flex h-11 items-center")}>{header}</div>
            <div aria-hidden className={cn("border-border absolute inset-x-0 top-13 border-t")} />
          </>
        ) : null}
        <div
          ref={bodyRef}
          data-slot="dialog-body"
          className={cn(
            "-m-1 min-h-0 [scrollbar-color:var(--muted-foreground)_transparent] overflow-y-auto p-1 pointer-coarse:[scrollbar-width:none]",
          )}
        >
          {children}
        </div>
        {/* Drawn scrollbar for touch screens, where the native one stays hidden until scrolling. */}
        <div
          ref={trackRef}
          data-slot="dialog-scroll-track"
          aria-hidden
          className={cn(
            "bg-muted pointer-events-none absolute hidden w-1.5 rounded-full pointer-coarse:data-scrollable:block",
          )}
        >
          <div ref={thumbRef} className={cn("bg-muted-foreground w-full rounded-full")} />
        </div>
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className={cn(
              // pr-4, this glyph's right edge, and `+ 3` in useScrollIndicator.ts are one corner. On
              // pointer-coarse the glyph's right edge meets the drawn track; on a precise pointer it
              // meets the native scrollbar (pr-4 minus the body's -m-1). The track formula does not change.
              // On a precise pointer the glyph's top stays 16 px. On pointer-coarse the whole control is
              // raised so the icon's top gap equals its right gap (3 px from the padding edge). The visible
              // plate is the same 36 px ghost square as the pencil and trash buttons, centered on the glyph
              // so the glyph's right edge does not move.
              "group absolute top-2 right-3 size-11 outline-none disabled:pointer-events-none pointer-coarse:top-[-5px] pointer-coarse:right-[3px]",
            )}
          >
            <span
              className={cn(
                "group-hover:bg-accent group-hover:text-accent-foreground group-focus-visible:border-ring group-focus-visible:ring-ring/50 absolute -top-0.5 -right-2.5 flex size-9 items-center justify-center rounded-md transition-colors group-focus-visible:ring-[3px] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
              )}
            >
              <XIcon aria-hidden />
            </span>
            <span className={cn("sr-only")}>Zamknij</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Zamknij</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
