import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-md border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current transition-colors",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        success:
          "border-stable-border bg-stable-surface text-stable dark:bg-stable/15 dark:text-stable [&>svg]:text-stable *:data-[slot=alert-description]:text-stable/80 dark:*:data-[slot=alert-description]:text-stable/80",
        warning:
          "border-bottleneck-border bg-bottleneck-surface text-bottleneck dark:bg-bottleneck/15 dark:text-bottleneck [&>svg]:text-bottleneck *:data-[slot=alert-description]:text-bottleneck/80 dark:*:data-[slot=alert-description]:text-bottleneck/80",
        destructive:
          "border-destructive/30 bg-destructive/5 text-red-700 dark:bg-destructive/10 dark:text-red-400 [&>svg]:text-red-700 dark:[&>svg]:text-red-400 *:data-[slot=alert-description]:text-red-700/90 dark:*:data-[slot=alert-description]:text-red-400/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
