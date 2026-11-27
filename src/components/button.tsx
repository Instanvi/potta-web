import React, { forwardRef, ReactNode } from 'react';

type Props = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> & {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  text: any;
  icon?: ReactNode;
  theme?: keyof typeof themes;
  type: 'submit' | 'button' | 'reset';
  isLoading?: boolean;
  disabled?: boolean;
  width?: 'full';
  height?: boolean;
  color?: boolean;
  rounded?: boolean;
  className?: string;
};

/* Talk-aligned button variants (same corner radius + solid primary). */
const themes = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  lightBlue: 'bg-secondary !text-secondary-foreground hover:bg-secondary/85',
  light: 'bg-primary-500 hover:bg-primary',
  red: 'bg-destructive hover:bg-destructive/90',
  lightGreen: 'bg-primary hover:bg-brand-hover',
  gray: 'bg-muted !text-foreground hover:bg-black/[0.08]',
  dark: 'bg-gray-900 hover:bg-gray-800',
  danger: 'bg-destructive hover:bg-destructive/90',
  outline: 'border border-input !text-foreground bg-background hover:bg-accent',
};

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    onClick,
    text,
    icon,
    theme,
    color,
    type,
    isLoading,
    disabled,
    width,
    height,
    rounded,
    className,
    ...rest
  },
  ref,
) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[2px] text-base font-normal shadow-none transition-colors ${
        color ? 'text-black' : 'text-white'
      } ${disabled || isLoading ? 'cursor-not-allowed' : 'cursor-pointer'} ${
        width ? 'w-full' : ''
      } ${theme ? themes[theme] : themes.default} ${
        rounded ? '!rounded-full' : ''
      } ${height ? 'h-9 px-3 text-sm' : 'h-10 px-4'} ${
        isLoading || disabled ? 'opacity-50' : 'opacity-100'
      } ${className ?? ''}`}
      onClick={onClick}
    >
      {isLoading ? (
        <span
          className="inline-block size-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden
        />
      ) : (
        icon
      )}
      {text}
    </button>
  );
});

export default Button;
