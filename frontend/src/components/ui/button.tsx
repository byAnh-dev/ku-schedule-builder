import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "portalPrimary" | "portalSecondary" | "portalTile" | "portalUtility" | "portalDanger", size?: "default" | "sm" | "lg" | "icon" }>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap text-[14px] font-normal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-portal-utility disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-slate-900 text-slate-50 hover:bg-slate-900/90 rounded-md": variant === "default",
            "bg-red-500 text-slate-50 hover:bg-red-500/90 rounded-md": variant === "destructive",
            "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 rounded-md": variant === "outline",
            "bg-slate-100 text-slate-900 hover:bg-slate-100/80 rounded-md": variant === "secondary",
            "hover:bg-slate-100 hover:text-slate-900 rounded-md": variant === "ghost",
            "text-slate-900 underline-offset-4 hover:underline": variant === "link",
            
            // Portal Variants
            "bg-portal-blue text-white hover:bg-portal-blue/90 rounded-portal-btn h-[32px] px-4": variant === "portalPrimary",
            "bg-white text-portal-text border border-portal-border hover:bg-slate-50 rounded-portal-btn h-[32px] px-4": variant === "portalSecondary",
            "bg-white text-portal-blue border-2 border-portal-blue hover:bg-slate-50 rounded-portal-btn h-[54px] px-4 font-bold": variant === "portalTile",
            "bg-portal-utility text-white hover:bg-portal-utility/90 rounded-portal-btn h-[32px] px-4": variant === "portalUtility",
            "bg-portal-danger text-white hover:bg-portal-danger/90 rounded-portal-btn h-[32px] px-4": variant === "portalDanger",

            // Sizes (only apply to non-portal variants or if explicitly needed, but portal variants have fixed heights usually)
            "h-10 px-4 py-2": size === "default" && !variant?.startsWith("portal"),
            "h-9 rounded-md px-3": size === "sm" && !variant?.startsWith("portal"),
            "h-11 rounded-md px-8": size === "lg" && !variant?.startsWith("portal"),
            "h-10 w-10": size === "icon" && !variant?.startsWith("portal"),
            "h-8 w-8": size === "icon" && variant?.startsWith("portal"),
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
