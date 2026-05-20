"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "./utils";

function Progress({
  className,
  value,
  style,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const customBg = style?.['--progress-background' as any];
  
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn("h-full w-full flex-1 transition-all", !customBg && "bg-primary")}
        style={{ 
          transform: `translateX(-${100 - (value || 0)}%)`,
          backgroundColor: customBg as string || undefined,
        }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };