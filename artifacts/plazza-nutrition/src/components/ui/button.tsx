import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-none border text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0' +
    ' hover:-translate-y-px',
  {
    variants: {
      variant: {
        default:
          // @replit: no hover, and add primary border
          'bg-primary text-primary-foreground border-primary',
        destructive:
          'bg-destructive text-destructive-foreground border-destructive',
        outline:
          // @replit Shows the background color of whatever card / sidebar / accent background it is inside of.
          // Inherits the current text color. Uses shadow-xs. no shadow on active
          // No hover state
          'border-border bg-transparent text-foreground active:shadow-none ',
        secondary:
          // @replit border, no hover, no shadow, secondary border.
          'border-secondary bg-secondary text-secondary-foreground ',
        // @replit no hover, transparent border
        ghost: 'border-transparent bg-transparent text-muted-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        // @replit changed sizes
        default: 'px-4 py-3',
        sm: 'min-h-9 px-3 text-[11px]',
        lg: 'min-h-12 px-8',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
