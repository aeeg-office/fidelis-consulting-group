import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

const variants = {
  variant: {
    primary: "bg-gold text-white hover:bg-gold-light shadow-sm",
    navy: "bg-navy text-white hover:bg-navy-light shadow-sm",
    secondary: "bg-transparent text-navy border border-navy hover:bg-ivory",
    ghost: "bg-transparent text-navy hover:bg-ivory",
    danger: "bg-error text-white hover:bg-red-700",
    goldOutline: "bg-transparent text-gold border border-gold hover:bg-gold/10",
  },
  size: {
    sm: "h-9 px-4 text-sm rounded-md",
    md: "h-11 px-6 text-base rounded-md",
    lg: "h-13 px-8 text-lg rounded-lg",
    xl: "h-14 px-10 text-lg rounded-lg",
  },
} as const;

type Variant = keyof typeof variants.variant;
type Size = keyof typeof variants.size;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 font-[family-name:var(--font-body)] font-semibold transition-all duration-200",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variants.variant[variant],
          variants.size[size],
          fullWidth && "w-full",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };