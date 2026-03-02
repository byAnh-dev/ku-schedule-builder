import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-[12px] font-bold transition-colors focus:outline-none focus:ring-1 focus:ring-portal-utility",
        {
          "border-transparent bg-portal-blue text-white": variant === "default",
          "border-transparent bg-portal-toolbar text-portal-text": variant === "secondary",
          "border-transparent bg-portal-danger text-white": variant === "destructive",
          "text-portal-text border-portal-border": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
