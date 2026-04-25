'use client';
import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, Building } from 'lucide-react';
import Input from '../../../../../components/input';
import Button from '../../../../../components/button';
import { DateInput } from '../../../../../components/customDatePicker';

interface EditScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scenarioData: {
    name: string;
    start_date: string;
    end_date: string;
    notes: string;
  }) => Promise<void>;
  scenario: {
    scenario_id: string;
    name: string;
    start_date: string;
    end_date: string;
    notes: string;
  } | null;
  organizationId: string;
}

const EditScenarioModal: React.FC<EditScenarioModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  scenario,
  organizationId,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    start_date: new Date(),
    end_date: new Date(),
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Animation effect
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Update form data when scenario changes
  useEffect(() => {
    if (scenario) {
      setFormData({
        name: scenario.name,
        start_date: new Date(scenario.start_date),
        end_date: new Date(scenario.end_date),
        notes: scenario.notes || '',
      });
    }
  }, [scenario]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange =
    (field: 'start_date' | 'end_date') => (date: Date | undefined) => {
      if (date) {
        setFormData((prev) => ({
          ...prev,
          [field]: date,
        }));
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        start_date: formData.start_date.toISOString().split('T')[0],
        end_date: formData.end_date.toISOString().split('T')[0],
      });
      onClose();
    } catch (error) {
      console.error('Error updating scenario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen || !scenario) return null;

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
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Edit Scenario
              </h2>
              <p className="text-sm text-gray-500">Update scenario details</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Scenario Name */}
          <Input
            type="text"
            name="name"
            label="Scenario Name "
            value={formData.name}
            required
            onchange={handleInputChange}
            placeholder="Enter scenario name"
            className="w-full"
          />

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <DateInput
              name="start_date"
              label="Start Date "
              value={formData.start_date}
              onChange={handleDateChange('start_date')}
              placeholder="Select start date"
              required
              className="w-full"
            />
            <DateInput
              name="end_date"
              label="End Date "
              value={formData.end_date}
              onChange={handleDateChange('end_date')}
              placeholder="Select end date"
              required
              className="w-full"
            />
          </div>

          {/* Notes */}
          <Input
            type="text"
            name="notes"
            label="Description"
            value={formData.notes}
            onchange={handleInputChange}
            placeholder="Describe this scenario..."
            className="w-full"
          />

          {/* Organization Info */}
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex items-center text-sm text-gray-600">
              <Building className="h-4 w-4 mr-2" />
              <span>Organization: {organizationId}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              text={isSubmitting ? 'Updating...' : 'Update Scenario'}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditScenarioModal;
