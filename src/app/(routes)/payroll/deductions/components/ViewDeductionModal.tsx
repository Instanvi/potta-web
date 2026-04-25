import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  FileText,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle,
  Info,
  Calculator,
  DollarSign,
  Tag,
} from 'lucide-react';
import moment from 'moment';
import { deductionsApi } from '../utils/api';
import { DecductionProps } from '../utils/types';

interface ViewDeductionModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  deductionId: string | null;
}

function formatDate(date: string) {
  return moment(date).format('MMM DD, YYYY');
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

const ViewDeductionModal = ({
  open,
  setOpen,
  deductionId,
}: ViewDeductionModalProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [deduction, setDeduction] = useState<
    | (DecductionProps & {
        uuid?: string;
        createdAt?: string;
        updatedAt?: string;
      })
    | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (open && deductionId) {
      fetchDeduction();
    }
  }, [open, deductionId]);

  const fetchDeduction = async () => {
    if (!deductionId) return;

    setIsLoading(true);
    try {
      const response = await deductionsApi.getByid(deductionId);
      setDeduction(response.data || response);
    } catch (error) {
      console.error('Error fetching deduction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible || !deduction) return null;

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <AlertCircle className="h-4 w-4 text-gray-600" />
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'percentage':
        return <Calculator className="h-4 w-4" />;
      case 'fixed':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

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
        className={`fixed inset-0 bg-white transition-transform duration-300 ease-in-out transform ${
          isAnimating ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-2xl font-medium text-gray-900">
                  {deduction.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(deduction.is_active)}
                  <span
                    className={`px-2 capitalize py-1 text-sm font-medium ${
                      deduction.is_active ? 'text-green-700' : 'text-gray-600'
                    }`}
                  >
                    {deduction.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 hover:bg-gray-100 transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="p-6 overflow-y-auto"
          style={{ height: 'calc(100vh - 88px)' }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading deduction details...</div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Deduction Overview */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Deduction Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50">
                      <Tag className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Type</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {deduction.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50">
                      <Settings className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Mode</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {deduction.mode}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50">
                      {getTypeIcon(deduction.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Value</p>
                      <p className="text-sm font-medium text-gray-900">
                        {deduction.type === 'percentage'
                          ? `${deduction.value}%`
                          : formatCurrency(Number(deduction.value))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Applies To
                      </p>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {deduction.applies_to}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {deduction.description && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Description
                  </h3>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-700">
                      {deduction.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Tax Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Tax Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle
                      className={`h-3 w-3 ${
                        deduction.is_tax ? 'text-green-600' : 'text-gray-400'
                      }`}
                    />
                    <span className="text-gray-700">
                      {deduction.is_tax
                        ? 'This is a tax deduction'
                        : 'This is not a tax deduction'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle
                      className={`h-3 w-3 ${
                        deduction.is_editable
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}
                    />
                    <span className="text-gray-700">
                      {deduction.is_editable
                        ? 'This deduction is editable'
                        : 'This deduction is not editable'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Brackets Information */}
              {deduction.brackets && deduction.brackets.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Tax Brackets
                  </h3>
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="space-y-2">
                      {deduction.brackets.map((bracket, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {formatCurrency(bracket.min)} -{' '}
                            {formatCurrency(bracket.max)}
                          </span>
                          <span className="font-medium text-gray-900">
                            {bracket.rate}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata */}
              {(deduction.createdAt || deduction.updatedAt) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Metadata
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {deduction.createdAt && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Created
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(deduction.createdAt)}
                          </p>
                        </div>
                      </div>
                    )}
                    {deduction.updatedAt && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Last Updated
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(deduction.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewDeductionModal;
