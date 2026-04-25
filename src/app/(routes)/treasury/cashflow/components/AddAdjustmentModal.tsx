'use client';
import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Calculator } from 'lucide-react';
import Input from '../../../../../components/input';
import Select from '../../../../../components/select';
import Button from '../../../../../components/button';

interface AddAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (adjustmentData: {
    target_metric: string;
    rule_type: string;
    value_expr: string;
    priority: number;
  }) => void;
  organizationId: string;
  currentScenario?: {
    scenario_id: string;
    adjustments: Array<{
      target_metric: string;
      rule_type: string;
      value_expr: string;
    }>;
  } | null;
}

const AddAdjustmentModal: React.FC<AddAdjustmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  organizationId,
  currentScenario,
}) => {
  const [formData, setFormData] = useState({
    target_metric: 'fcf',
    rule_type: 'percentage',
    value_expr: '10',
    priority: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const allMetrics = [
    { value: 'fcf', label: 'Free Cash Flow (FCF)' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'cogs', label: 'Cost of Goods Sold (COGS)' },
    { value: 'opex', label: 'Operating Expenses (OPEX)' },
    { value: 'salary_expense', label: 'Salary Expense' },
    { value: 'tax', label: 'Tax' },
    { value: 'ocf', label: 'Operating Cash Flow (OCF)' },
  ];

  // Filter out metrics that already have adjustments
  const availableMetrics = allMetrics.filter((metric) => {
    if (!currentScenario?.adjustments) return true;
    return !currentScenario.adjustments.some(
      (adjustment) => adjustment.target_metric === metric.value
    );
  });

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Reset form when opening modal
      setFormData({
        target_metric: availableMetrics[0]?.value || 'fcf',
        rule_type: 'percentage',
        value_expr: '10',
        priority: 1,
      });
    } else {
      setIsVisible(false);
    }
  }, [isOpen, availableMetrics]);

  const ruleTypes = [
    { value: 'percentage', label: 'Percentage Change (%)' },
    { value: 'absolute', label: 'Absolute Value' },
    { value: 'multiplier', label: 'Multiplier' },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'priority' ? parseInt(value) || 1 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.value_expr.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        target_metric: 'fcf',
        rule_type: 'percentage',
        value_expr: '10',
        priority: 1,
      });
      onClose();
    } catch (error) {
      console.error('Error creating adjustment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
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
          <h2 className="text-xl font-medium text-gray-900">
            Add Adjustment
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Show message if no metrics available */}
          {availableMetrics.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">
                    All metrics have adjustments
                  </h3>
                  <p className="text-sm text-blue-600 mt-1">
                    This scenario already has adjustments for all available
                    metrics. You can edit or delete existing adjustments
                    instead.
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* Target Metric */}
          <div>
       
            <Select
              selectedValue={formData.target_metric}
              options={availableMetrics}
              onChange={(value: string) =>
                setFormData({ ...formData, target_metric: value })
              }
              bg="bg-white"
              name="Select metric"
              label="Target Metric"
              required
              isDisabled={availableMetrics.length === 0}
            />
          </div>

          {/* Rule Type */}
          <div>
     
            <Select
              selectedValue={formData.rule_type}
              options={ruleTypes}
              onChange={(value: string) =>
                setFormData({ ...formData, rule_type: value })
              }
              bg="bg-white"
              name="Select rule type"
              label="Adjustment Type"
              required
              isDisabled={availableMetrics.length === 0}
            />
          </div>

          {/* Value Expression */}
          <Input
            type="text"
            name="value_expr"
            label="Value *"
            value={formData.value_expr}
            onchange={handleInputChange}
            placeholder={
              formData.rule_type === 'percentage'
                ? 'e.g., 10 (for 10% increase)'
                : formData.rule_type === 'absolute'
                ? 'e.g., 50000 (for XAF 50,000)'
                : 'e.g., 1.2 (for 20% increase)'
            }
            className="w-full"
            disabled={availableMetrics.length === 0}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.rule_type === 'percentage' &&
              'Enter percentage (e.g., 10 for 10% increase)'}
            {formData.rule_type === 'absolute' && 'Enter absolute value in XAF'}
            {formData.rule_type === 'multiplier' &&
              'Enter multiplier (e.g., 1.2 for 20% increase)'}
          </p>

          {/* Priority */}
          <Input
            type="number"
            name="priority"
            label="Priority"
            value={formData.priority}
            onchange={handleInputChange}
            placeholder="1-10"
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Higher numbers = higher priority (1-10)
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.value_expr.trim() ||
                availableMetrics.length === 0
              }
              text={isSubmitting ? 'Adding...' : 'Add Adjustment'}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdjustmentModal;
