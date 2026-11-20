'use client';
import React, { useState, useEffect } from 'react';
import SearchableSelect from '@potta/components/searchableSelect';
import BenefitTable from './components/benefitTable';
import { toast } from 'react-hot-toast';
import Button from '@potta/components/button';
import { useBenefits } from './hooks/useBenefits';
import { useEmployeeBenefits } from './hooks/useEmployeeBenefits';

interface PageProps {
  params: { personId?: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function Page({ params, searchParams }: PageProps) {
  const personId = params.personId || '';

  return <BenefitContent personId={personId} />;
}

interface BenefitProps {
  personId?: string;
  onComplete?: () => void;
}

const BenefitContent: React.FC<BenefitProps> = ({ personId, onComplete }) => {
  // Fetch available benefits
  const { benefits: benefitOptions, loading: benefitsLoading } = useBenefits();

  // Manage employee benefits
  const {
    selectedBenefits,
    loading: employeeBenefitsLoading,
    saving: isSaving,
    hasChanges,
    isComplete,
    addBenefit,
    removeBenefit,
    saveBenefits,
  } = useEmployeeBenefits(personId);

  // Benefit selection state
  const [benefitSelectValue, setBenefitSelectValue] = useState<string>('');

  // Handle completion
  useEffect(() => {
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  // Handle benefit selection
  const handleBenefitChange = (value: string) => {
    // If empty value, do nothing
    if (!value) {
      return;
    }

    setBenefitSelectValue(value);

    // Find the selected benefit
    const selectedBenefit = benefitOptions.find(
      (benefit) => benefit.name === value
    );

    if (selectedBenefit) {
      // Add benefit to selection
      addBenefit(selectedBenefit);

      // Reset select value
      setBenefitSelectValue('');
    } else {
      console.log('Could not find benefit with name:', value);
      // Reset select value if not found
      setBenefitSelectValue('');
    }
  };

  // Handle save
  const handleSave = async () => {
    await saveBenefits();

    // Show completion toast
    toast.success('Employee setup completed successfully!');
  };

  // Convert benefit options for select component
  const availableBenefitOptions = [
    { label: 'Select a benefit to add', value: '' },
    ...benefitOptions
      .filter(
        (benefit) =>
          !selectedBenefits.some((selected) => selected.uuid === benefit.uuid)
      )
      .map((benefit) => ({
        label: benefit.name || 'Unnamed Benefit',
        value: benefit.name || '',
      })),
  ];

  if (benefitsLoading || employeeBenefitsLoading) {
    return (
      <div className="w-full pt-5 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pt-5 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-xl font-medium text-gray-900">
            Employee Benefits
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Add and manage benefits for this employee
          </p>
        </div>

        {/* Add Benefits Section */}
        <div className="bg-white border border-gray-200  p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Add Benefits</h3>
            <div className="flex items-center text-sm text-gray-500">
              <i className="ri-information-line mr-1"></i>
              {availableBenefitOptions.length - 1} benefits available
            </div>
          </div>

          <div className="max-w-md">
            <SearchableSelect
              label="Select Benefit"
              options={availableBenefitOptions}
              selectedValue={benefitSelectValue}
              onChange={handleBenefitChange}
              placeholder="Choose a benefit to add"
              isDisabled={availableBenefitOptions.length <= 1}
            />
          </div>

          {availableBenefitOptions.length <= 1 && (
            <p className="text-sm text-gray-500 mt-2">
              All available benefits have been added to this employee
            </p>
          )}
        </div>

        {/* Selected Benefits */}
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Selected Benefits
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <i className="ri-shield-check-line mr-1"></i>
              {selectedBenefits.length} benefits selected
            </div>
          </div>

          {selectedBenefits.length > 0 ? (
            <div className="space-y-3">
              {selectedBenefits.map((benefit) => (
                <div
                  key={benefit.uuid}
                  className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <i className="ri-shield-check-line text-green-600"></i>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {benefit.name}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <i className="ri-bookmark-line mr-1"></i>
                          {benefit.type || 'N/A'}
                        </span>
                        <span className="flex items-center">
                          <i className="ri-percent-line mr-1"></i>
                          {benefit.rate || 'N/A'}
                        </span>
                        <span className="flex items-center">
                          <i className="ri-building-line mr-1"></i>
                          {benefit.provider || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeBenefit(benefit.uuid)}
                    className="flex items-center text-red-600 hover:text-red-800 transition-colors"
                  >
                    <i className="ri-delete-bin-line mr-1"></i>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-shield-line text-gray-400 text-2xl"></i>
              </div>
              <h4 className="text-gray-600 font-medium mb-2">
                No benefits selected
              </h4>
              <p className="text-gray-500 text-sm">
                Choose benefits from the dropdown above to add them to this
                employee
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        {personId && (
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-500">
              {hasChanges ? (
                <span className="text-amber-600">
                  <i className="ri-information-line mr-1"></i>
                  You have unsaved changes
                </span>
              ) : (
                <span className="text-green-600">
                  <i className="ri-check-line mr-1"></i>
                  All changes saved
                </span>
              )}
            </div>
            <Button
              type="submit"
              text={isSaving ? 'Saving Benefits...' : 'Save & Continue'}
              onClick={handleSave}
              disabled={
                isSaving || (!hasChanges && selectedBenefits.length === 0)
              }
              className="min-w-[160px]"
            />
          </div>
        )}
      </div>
    </div>
  );
};
