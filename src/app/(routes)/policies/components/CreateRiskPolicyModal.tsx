'use client';
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  RiskPolicy,
  CreateRiskPolicyRequest,
  UpdateRiskPolicyRequest,
} from '../utils/risk-management-api';
import {
  useCreateRiskPolicy,
  useUpdateRiskPolicy,
  useGetRiskPolicy,
} from '../hooks/riskManagementHooks';
import toast from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RiskPolicyForm from './RiskPolicyForm';
import PottaLoader from '@potta/components/pottaloader';
import { AlertTriangle } from 'lucide-react';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface CreateRiskPolicyModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  policy?: RiskPolicy | null;
  onSave: () => void;
}

const CreateRiskPolicyModal: React.FC<CreateRiskPolicyModalProps> = ({
  open,
  setOpen,
  policy,
  onSave,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const createMutation = useCreateRiskPolicy();
  const updateMutation = useUpdateRiskPolicy();

  // Fetch the full policy details by ID when editing
  const {
    data: fullPolicy,
    isLoading,
    error,
  } = useGetRiskPolicy(policy?.uuid || '');

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

  // Function to clean data for update API (remove database metadata fields)
  const cleanDataForUpdate = (data: any) => {
    const cleanedData = { ...data };

    // Clean rules array
    if (cleanedData.rules) {
      cleanedData.rules = cleanedData.rules.map((rule: any) => {
        const cleanedRule = {
          operator: rule.operator,
          conditions: rule.conditions.map((condition: any) => ({
            field: condition.field,
            operator: condition.operator,
            value: condition.value,
          })),
          actions: rule.actions.map((action: any) => ({
            type: action.type,
            params: action.params || {},
          })),
        };
        return cleanedRule;
      });
    }

    // Clean actions array
    if (cleanedData.actions) {
      cleanedData.actions = cleanedData.actions.map((action: any) => ({
        type: action.type,
        params: action.params || {},
      }));
    }

    // Remove any other database metadata fields
    delete cleanedData.uuid;
    delete cleanedData.orgId;
    delete cleanedData.createdAt;
    delete cleanedData.createdBy;
    delete cleanedData.updatedAt;
    delete cleanedData.updatedBy;
    delete cleanedData.deletedAt;

    return cleanedData;
  };

  const handleSubmit = async (
    data: CreateRiskPolicyRequest | UpdateRiskPolicyRequest
  ) => {
    if (policy) {
      // Update existing policy - clean the data first
      const cleanedData = cleanDataForUpdate(data);
      updateMutation.mutate(
        { policyId: policy.uuid, data: cleanedData as UpdateRiskPolicyRequest },
        {
          onSuccess: () => {
            toast.success('Risk policy updated successfully');
            onSave();
            handleClose();
          },
          onError: (error: any) => {
            const errorMessage =
              error?.response?.data?.message ||
              error?.response?.data?.error ||
              error?.message ||
              'Unknown error';
            toast.error(`Failed to update risk policy: ${errorMessage}`);
            console.error('Error updating risk policy:', error);
          },
        }
      );
    } else {
      // Create new policy
      createMutation.mutate(data as CreateRiskPolicyRequest, {
        onSuccess: () => {
          toast.success('Risk policy created successfully');
          onSave();
          handleClose();
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            'Unknown error';
          toast.error(`Failed to create risk policy: ${errorMessage}`);
          console.error('Error creating risk policy:', error);
        },
      });
    }
  };

  if (!isVisible) return null;

  // Use the full policy data if available, otherwise fall back to the passed policy
  const displayPolicy = fullPolicy || policy;

  // Show loading state while fetching full policy details (only when editing)
  if (policy && isLoading) {
    return <PottaLoader />;
  }

  // Show error state if fetching failed (only when editing)
  if (policy && error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Policy
            </h3>
            <p className="text-gray-600 mb-4">
              Failed to load policy details. Please try again.
            </p>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <h2 className="text-2xl font-medium">
            {displayPolicy ? 'Edit Risk Policy' : 'Create Risk Policy'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div
          className="p-6 space-y-6 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 140px)' }}
        >
          <QueryClientProvider client={queryClient}>
            <div className="bg-white">
              <RiskPolicyForm
                initialData={displayPolicy}
                onSubmit={handleSubmit}
                onCancel={handleClose}
              />
            </div>
          </QueryClientProvider>
        </div>
      </div>
    </div>
  );
};

export default CreateRiskPolicyModal;
