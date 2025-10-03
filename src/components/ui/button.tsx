// Updated src/components/ui/button.tsx with Parisian styling
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haussmann focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-parisian hover:shadow-parisian-lg transform hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-haussmann text-cream hover:bg-haussmann/90 font-semibold",
        destructive: "bg-brick text-cream hover:bg-brick/90 font-semibold",
        outline: "border-2 border-stone bg-transparent text-charcoal hover:bg-stone hover:text-night",
        secondary: "bg-sage text-night hover:bg-sage/90 font-semibold",
        ghost: "text-charcoal hover:bg-stone hover:text-night",
        link: "text-haussmann underline-offset-4 hover:underline",
        accent: "bg-ochre text-night hover:bg-ochre/90 font-semibold",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-14 rounded-lg px-8 text-base font-semibold",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }