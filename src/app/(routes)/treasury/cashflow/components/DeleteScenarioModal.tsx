'use client';
import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import Button from '../../../../../components/button';

interface DeleteScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  scenarioName: string;
}

const DeleteScenarioModal: React.FC<DeleteScenarioModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  scenarioName,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting scenario:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`bg-white shadow-xl w-full max-w-md mx-4 transform transition-all duration-300 ease-in-out ${
          isVisible
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Delete Scenario
              </h2>
              <p className="text-sm text-gray-500">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Are you sure you want to delete this scenario?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                You are about to delete the scenario{' '}
                <strong>"{scenarioName}"</strong>. This will permanently remove
                the scenario and all its associated data.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This action cannot be undone. All
                  adjustments and forecast data associated with this scenario
                  will be lost.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            theme="danger"
            text={isDeleting ? 'Deleting...' : 'Delete Scenario'}
          />
        </div>
      </div>
    </div>
  );
};

export default DeleteScenarioModal;
