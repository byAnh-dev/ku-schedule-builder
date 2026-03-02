import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[34px] w-full rounded-none border border-portal-border bg-white px-3 py-1 text-[14px] file:border-0 file:bg-transparent file:text-[14px] file:font-medium placeholder:text-portal-text-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-portal-utility disabled:cursor-not-allowed disabled:opacity-50",
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
