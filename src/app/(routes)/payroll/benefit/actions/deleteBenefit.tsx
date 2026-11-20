import React from 'react';

interface Benefit {
  uuid: string;
  name: string;
  description: string;
  type: 'FINANCIAL' | 'SERVICE' | 'REDEEMABLE';
  value: string;
  cycle:
    | 'DAILY'
    | 'WEEKLY'
    | 'MONTHLY'
    | 'QUARTERLY'
    | 'ANNUALLY'
    | 'ONE_TIME'
    | 'NONE';
  is_taxable: boolean;
  tax_cap: string;
  rate: string;
  salary_cap: string;
  max_amount: string;
  provider: string;
  expires_at: string | null;
  role_based: boolean;
  is_default: boolean;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  eligible_roles: any[];
  createdAt: string;
  updatedAt: string;
}

interface DeleteBenefitProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  benefit: Benefit | null;
}

const DeleteBenefit: React.FC<DeleteBenefitProps> = ({
  isOpen,
  onClose,
  onConfirm,
  benefit,
}) => {
  if (!isOpen || !benefit) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-sm shadow-xl max-w-md w-full animate-fade-in">
        <div className="px-6 pt-6 pb-4">
          {/* Danger Icon */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          <div className="mt-3 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete Benefit
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Are you sure you want to delete the benefit "{benefit.name}"? This
              action cannot be undone and will remove this benefit from all
              employees.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Add fade-in animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default DeleteBenefit;
