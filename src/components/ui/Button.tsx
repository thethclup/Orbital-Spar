import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'cosmic';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          {
            'bg-white text-black hover:bg-neutral-200': variant === 'primary',
            'bg-neutral-800 text-white hover:bg-neutral-700': variant === 'secondary',
            'border-2 border-white/20 bg-transparent text-white hover:bg-white/10': variant === 'outline',
            'bg-gradient-to-r from-purple-600 to-cyan-500 text-white cosmic-shadow-cyan hover:opacity-90': variant === 'cosmic',
            'h-9 px-4 text-sm': size === 'sm',
            'h-12 px-6 text-base': size === 'md',
            'h-16 px-10 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
