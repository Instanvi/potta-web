import React, { ReactNode } from 'react';

type Props = {
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

const Button = ({
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
}: Props) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[2px] text-sm font-medium shadow-none transition-colors ${
        color ? 'text-black' : 'text-white'
      } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${
        width ? 'w-full' : ''
      } ${theme ? themes[theme] : themes.default} ${
        rounded ? '!rounded-full' : ''
      } ${height ? 'h-8 px-3 text-xs' : 'h-9 px-4'} ${
        isLoading || disabled ? 'opacity-50' : 'opacity-100'
      } ${className}`}
      onClick={onClick}
    >
      {icon && icon}
      {isLoading ? 'Loading...' : text}
    </button>
  );
};

export default Button;
