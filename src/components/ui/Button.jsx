import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motionTransitions } from '../../lib/motion-tokens';

const variantStyles = {
  default:
    'bg-text-primary text-bg hover:opacity-90 shadow-xs border border-transparent font-medium cursor-pointer',
  primary:
    'bg-text-primary text-bg hover:opacity-90 shadow-xs border border-transparent font-medium cursor-pointer',
  secondary:
    'bg-surface border border-border text-text-primary hover:bg-surface-hover hover:border-border-hover cursor-pointer',
  outline:
    'bg-transparent border border-border text-text-primary hover:bg-surface-hover hover:border-border-hover cursor-pointer',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-transparent cursor-pointer',
  destructive:
    'bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white cursor-pointer',
  success:
    'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500 hover:text-white cursor-pointer',
  link: 'bg-transparent text-text-primary underline-offset-4 hover:underline p-0 h-auto border-0 focus-ring shadow-none inline-flex cursor-pointer',
};

const sizeStyles = {
  sm: 'h-8 px-3 text-xs rounded-sm gap-1.5',
  md: 'h-10 px-4 text-sm rounded-md gap-2',
  lg: 'h-12 px-6 text-base rounded-lg gap-2.5',
  icon: 'h-10 w-10 p-0 rounded-md justify-center shrink-0',
};

export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    className,
    children,
    type = 'button',
    ...props
  },
  ref
) {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={motionTransitions.springSnappy}
      aria-busy={isLoading}
      className={cn(
        'focus-ring relative inline-flex items-center justify-center font-medium select-none transition-colors duration-150',
        variantStyles[variant],
        variant !== 'link' && sizeStyles[size],
        fullWidth && 'w-full',
        isDisabled && 'pointer-events-none cursor-not-allowed opacity-30',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className={cn('shrink-0 animate-spin', size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}

      {isLoading && loadingText ? (
        <span>{loadingText}</span>
      ) : (
        children && <span>{children}</span>
      )}

      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </motion.button>
  );
});

export default Button;