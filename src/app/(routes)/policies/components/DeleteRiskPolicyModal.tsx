import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Trash2, X } from 'lucide-react';
import { RiskPolicy } from '../utils/risk-management-api';
import { Button } from '@potta/components/shadcn/button';

interface DeleteRiskPolicyModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  policy: RiskPolicy | null;
  onDelete: () => void;
}

const DeleteRiskPolicyModal: React.FC<DeleteRiskPolicyModalProps> = ({
  open,
  setOpen,
  policy,
  onDelete,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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

  if (!isVisible || !policy) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Modal Container */}
      <div
        className={`fixed inset-0 flex items-center justify-center p-4 transition-all duration-300 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="relative bg-white shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-gray-900">
                  Delete Risk Policy
                </h2>
                <p className="text-sm text-gray-600">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2  transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
          

            {/* Warning */}
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Warning</p>
                <p>
                  Deleting this risk policy will permanently remove it and all
                  associated rules. This may affect your organization's risk
                  management processes.
                </p>
              </div>
            </div>

            {/* Impact Information */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">
                What will be deleted:
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Policy configuration and settings</li>
                <li>• All risk rules and conditions</li>
                <li>• All associated actions</li>
                <li>• Policy history and audit trail</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
       
            <Button variant="destructive" onClick={onDelete} className="">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Policy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteRiskPolicyModal;
