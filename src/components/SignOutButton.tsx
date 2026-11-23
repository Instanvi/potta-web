'use client';

import React, { useState } from 'react';
import { signOutWithAuthApi } from '@/lib/auth-sign-out';
import Button from '@potta/components/button';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

interface SignOutButtonProps {
  className?: string;
  variant?: 'default' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const SignOutButton: React.FC<SignOutButtonProps> = ({
  className = '',
  variant = 'default',
  children = 'Sign Out',
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Button
        type="button"
        text={children}
        onClick={() => setOpen(true)}
        theme={variant === 'danger' ? 'danger' : 'default'}
        className={className}
      />
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Sign out?"
        description="You will need to sign in again to continue using Potta."
        confirmText="Sign out"
        destructive
        isLoading={loading}
        onConfirm={() => {
          setLoading(true);
          void signOutWithAuthApi();
        }}
      />
    </>
  );
};

export default SignOutButton;
