'use client';
import React from 'react';
import { signOut } from 'next-auth/react';
import Button from '@potta/components/button';

interface SignOutButtonProps {
  className?: string;
  variant?: 'default' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const SignOutButton: React.FC<SignOutButtonProps> = ({
  className = '',
  variant = 'default',
  size = 'md',
  children = 'Sign Out',
}) => {


  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out?')) {
      signOut();
    }
  };

  return (
    <Button
      type="button"
      text={children}
      onClick={handleSignOut}
      theme={variant === 'danger' ? 'danger' : 'default'}
      className={className}
    />
  );
};

export default SignOutButton; 