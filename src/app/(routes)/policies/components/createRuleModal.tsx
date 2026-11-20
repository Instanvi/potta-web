'use client';
import React, { useState, useEffect } from 'react';
import { ApprovalRuleForm } from '../../policy/all';
import { ExtendedApprovalRule, User } from '../../policy/types/approval-rule';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreatePolicy } from '../../policy/hooks/policyHooks';
import toast from 'react-hot-toast';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Mock users data for demonstration
const mockUsers: User[] = [
  { id: 'user1', name: 'John Doe', email: 'john.doe@example.com' },
  { id: 'user2', name: 'Jane Smith', email: 'jane.smith@example.com' },
  { id: 'user3', name: 'Robert Johnson', email: 'robert.johnson@example.com' },
  { id: 'user4', name: 'Emily Davis', email: 'emily.davis@example.com' },
  { id: 'user5', name: 'Michael Wilson', email: 'michael.wilson@example.com' },
];

interface CreateRuleModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  onSave: (ruleData: ExtendedApprovalRule) => void;
}

const CreateRuleModal: React.FC<CreateRuleModalProps> = ({
  open,
  setOpen,
  onSave,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const mutation = useCreatePolicy();

  // Handle animation when modal opens or closes
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (data: ExtendedApprovalRule) => {
    mutation.mutate(data, {
      onSuccess: () => {
        toast.success(`Rule created successfully`);
        onSave(data);
        handleClose();
      },
      onError: (error: any) => {
        toast.error(
          `Failed to create Rule: ${error.message || 'Unknown error'}`
        );
        console.error('Error creating Rule Please Try again later:', error);
      },
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      ></div>

      {/* Modal Container */}
      <div
        className={`fixed inset-0 bg-white transition-transform duration-300 ease-in-out transform ${
          isAnimating ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-medium">Create Approval Rule</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div
          className="p-6 space-y-6 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 140px)' }}
        >
          <QueryClientProvider client={queryClient}>
            <div className="bg-white">
              <ApprovalRuleForm
                onSubmit={handleSubmit}
                onCancel={handleClose}
                users={mockUsers}
              />
            </div>
          </QueryClientProvider>
        </div>
      </div>
    </div>
  );
};

export default CreateRuleModal;
