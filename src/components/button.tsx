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

/* Variants follow instanvi-payroll-expense-fe components/ui/button.tsx. */
const themes = {
  default: 'bg-primary hover:bg-brand-hover',
  lightBlue: 'bg-secondary !text-secondary-foreground hover:bg-secondary/85',
  light: 'bg-primary-500 hover:bg-primary',
  red: 'bg-destructive hover:bg-destructive/90',
  lightGreen: 'bg-primary hover:bg-brand-hover',
  gray: 'bg-muted !text-foreground hover:bg-black/[0.08]',
  dark: 'bg-gray-900 hover:bg-gray-800',
  danger: 'bg-destructive hover:bg-destructive/90',
  outline: 'border border-input !text-foreground bg-background hover:bg-accent !py-[11px]',
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
      className={`whitespace-nowrap rounded-[2px] text-sm font-medium transition-colors ${
        color ? 'text-black' : 'text-white'
      } items-center text-center gap-2 ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      } ${width ? 'w-full text-center' : 'flex text-center justify-end'} ${
        theme ? themes[theme] : themes.default
      } ${rounded ? '!rounded-full' : ''}  ${height ? 'py-1.5' : 'py-3'}  px-6 ${
        isLoading || disabled ? 'opacity-65' : 'opacity-100'
      } ${className}`}
      onClick={onClick}
    >
      {icon && icon}
      {isLoading ? 'Loading...' : text}
    </button>
  );
};

export default Button;
