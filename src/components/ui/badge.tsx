// Updated src/components/ui/badge.tsx with Parisian styling and custom colors
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { getContrastColor } from "@/lib/tagColors"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-3 py-1 text-xs font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-haussmann focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-haussmann text-cream shadow-parisian hover:bg-haussmann/90",
        secondary: "border-transparent bg-stone text-charcoal shadow-parisian hover:bg-stone/80",
        destructive: "border-transparent bg-brick text-cream shadow-parisian hover:bg-brick/90",
        outline: "border-stone text-charcoal hover:bg-stone hover:text-night",
        // Category-specific variants
        material: "border-transparent bg-sage/20 text-sage border-sage/30 hover:bg-sage/30",
        color: "border-transparent bg-haussmann/20 text-haussmann border-haussmann/30 hover:bg-haussmann/30",
        style: "border-transparent bg-ochre/20 text-ochre border-ochre/30 hover:bg-ochre/30",
        accent: "border-transparent bg-ochre text-night shadow-parisian hover:bg-ochre/90",
        neighborhood: "border-transparent bg-brick/20 text-brick border-brick/30 hover:bg-brick/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  customColor?: string; // Hex color for custom background
}

function Badge({ className, variant, customColor, style, ...props }: BadgeProps) {
  // If customColor is provided, use inline styles
  const customStyle = customColor ? {
    backgroundColor: customColor,
    color: getContrastColor(customColor),
    borderColor: 'transparent',
    ...style
  } : style;

  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      style={customStyle}
      {...props}
    />
  )
}

export { Badge, badgeVariants }