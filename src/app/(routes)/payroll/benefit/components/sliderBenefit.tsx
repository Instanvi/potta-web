'use client';
import Button from '@potta/components/button';
import Checkbox from '@potta/components/checkbox';
import CurrencyInput from '@potta/components/currencyInput';
import CustomDatePicker from '@potta/components/customDatePicker';
import Input from '@potta/components/input';
import SearchableSelect from '@potta/components/searchableSelect';
import Slider from '@potta/components/slideover';
import TextArea from '@potta/components/textArea';
import React, { useEffect, useState } from 'react';
import { useBenefitForm } from '../hooks/useBenefitForm';
import {
  BENEFIT_TYPE_OPTIONS,
  EARNINGS_CATEGORY_OPTIONS,
  DEDUCTIONS_CATEGORY_OPTIONS,
  CYCLE_OPTIONS,
  SALARY_CAP_OPTIONS,
  BENEFIT_CATEGORIES,
  BENEFIT_CATEGORY_ENUM,
} from '../constants/benefitCategories';

interface SliderBenefitProps {
  isEditMode?: boolean;
  editBenefitId?: string;
  editBenefit?: any;
  onComplete?: () => void;
  onClose?: () => void;
}

const SliderBenefit: React.FC<SliderBenefitProps> = ({
  isEditMode = false,
  editBenefitId,
  editBenefit,
  onComplete,
  onClose,
}) => {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const {
    formData,
    expiryDate,
    isSliderOpen,
    isSubmitting,
    helpText,
    validationErrors,
    validationLimits,
    updateFormField,
    setExpiryDate,
    handleSubmit,
    openSlider,
    closeSlider,
    isLoading,
    isEditMode: hookEditMode,
    populateFormForEdit,
  } = useBenefitForm();

  // Effect to handle external edit mode
  useEffect(() => {
    if (isEditMode && editBenefit && !hookEditMode) {
      populateFormForEdit(editBenefit);
      if (!isSliderOpen) {
        openSlider();
      }
    }
  }, [
    isEditMode,
    editBenefit,
    hookEditMode,
    isSliderOpen,
    openSlider,
    populateFormForEdit,
  ]);

  const handleClose = (value?: boolean) => {
    closeSlider(value);
    if (onClose) {
      onClose();
    }
  };

  const handleFormSubmit = async (e?: React.FormEvent) => {
    await handleSubmit(e);
    if (onComplete) {
      onComplete();
    }
  };

  const {
    benefitName,
    benefitType,
    componentType,
    category,
    rateType,
    cycle,
    percentageValue,
    flatRateValue,
    salaryCap,
    customSalaryCap,
    taxCap,
    maxAmount,
    description,
    provider,
    isTaxable,
    isRoleBased,
    isDefault,
  } = formData;

  const selectedCategory = BENEFIT_CATEGORIES[category];
  const isPercentage = rateType === 'Percentage';
  const isMandatory = selectedCategory?.isMandatory;
  const isDeduction = selectedCategory?.isDeduction;

  // Get component type enum value for backend
  const getComponentTypeEnum = () => {
    return selectedCategory?.enumValue || BENEFIT_CATEGORY_ENUM.BASE_SALARY;
  };

  return (
    <Slider
      open={isSliderOpen}
      edit={false}
      setOpen={handleClose}
      title={hookEditMode ? 'Edit Benefit' : 'Add New Benefit'}
      buttonText="benefits"
    >
      <div className="space-y-8 w-full max-w-4xl">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Basic Information
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Essential details for the benefit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Benefit Name */}
            <Input
              label="Benefit Name"
              type="text"
              name="benefitName"
              placeholder="Enter benefit name"
              value={benefitName}
              onchange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateFormField('benefitName', e.target.value)
              }
              errors={validationErrors.benefitName}
              required
            />

            {/* Provider */}
            <Input
              label="Provider"
              type="text"
              name="provider"
              placeholder="Enter benefit provider"
              value={provider}
              onchange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateFormField('provider', e.target.value)
              }
              errors={validationErrors.provider}
            />
          </div>

          {/* Benefit Type */}
          <div>
            <SearchableSelect
              label="Benefit Type"
              selectedValue={benefitType}
              onChange={(value) => updateFormField('benefitType', value)}
              options={BENEFIT_TYPE_OPTIONS}
              placeholder="Select benefit type"
              required
              error={validationErrors.benefitType}
            />
            <p className="text-xs text-gray-500 mt-1">
              Financial: Monetary benefits, Service: Non-monetary benefits,
              Redeemable: Exchangeable benefits
            </p>
          </div>
        </div>

        {/* Component Type Section */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Component Type
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Select the type of payroll component
            </p>
          </div>

          {/* Component Type Selection */}
          <div className="space-y-4">
            <div className="flex space-x-6">
              <Checkbox
                id="earnings"
                label="Earnings"
                checked={componentType === 'earnings'}
                onChange={(checked) => {
                  if (checked) {
                    updateFormField('componentType', 'earnings');
                    updateFormField('category', '');
                  }
                }}
              />
              <Checkbox
                id="deductions"
                label="Deductions"
                checked={componentType === 'deductions'}
                onChange={(checked) => {
                  if (checked) {
                    updateFormField('componentType', 'deductions');
                    updateFormField('category', '');
                  }
                }}
              />
            </div>

            {/* Category Selection */}
            <div>
              <SearchableSelect
                label="Specific Category"
                selectedValue={category}
                onChange={(value) => {
                  updateFormField('category', value);
                  if (value && BENEFIT_CATEGORIES[value]) {
                    const config = BENEFIT_CATEGORIES[value];
                    updateFormField('rateType', config.rateType);
                    updateFormField('cycle', config.cycle);
                    updateFormField('isTaxable', config.isTaxable);
                  }
                }}
                options={
                  componentType === 'deductions'
                    ? DEDUCTIONS_CATEGORY_OPTIONS
                    : EARNINGS_CATEGORY_OPTIONS
                }
                placeholder={`Select ${
                  componentType === 'deductions' ? 'deduction' : 'earnings'
                } category`}
                required
                error={validationErrors.category}
              />
            </div>

            {/* Category Information */}
            {selectedCategory && (
              <div className="border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium  mb-2">
                      {category} Information
                    </h4>
                    <p className="text-sm mb-3">{selectedCategory.helpText}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="font-medium">Type:</span>
                        <span className=" ml-1">
                          {selectedCategory.rateType}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Cycle:</span>
                        <span className=" ml-1">{selectedCategory.cycle}</span>
                      </div>
                      <div>
                        <span className="font-medium">Taxable:</span>
                        <span className=" ml-1">
                          {selectedCategory.isTaxable ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Mandatory:</span>
                        <span className=" ml-1">
                          {isMandatory ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isMandatory && (
                    <div className="ml-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Mandatory
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rate Configuration Section */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Rate Configuration
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Set the rate and calculation method
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rate Type */}
            <div>
              <SearchableSelect
                label="Rate Type"
                selectedValue={rateType}
                onChange={(value) => updateFormField('rateType', value)}
                options={[
                  { label: 'Flat Rate', value: 'Flat Rate' },
                  { label: 'Percentage', value: 'Percentage' },
                ]}
                placeholder="Select rate type"
                required
                error={validationErrors.rateType}
                isDisabled={selectedCategory?.rateType ? true : false}
              />
              {selectedCategory?.rateType && (
                <p className="text-xs text-gray-500 mt-1">
                  Auto-configured based on category requirements
                </p>
              )}
            </div>

            {/* Cycle */}
            <div>
              <SearchableSelect
                label="Payment Cycle"
                selectedValue={cycle}
                onChange={(value) => updateFormField('cycle', value)}
                options={CYCLE_OPTIONS}
                placeholder="Select cycle"
                required
                error={validationErrors.cycle}
                isDisabled={selectedCategory?.cycle ? true : false}
              />
              {selectedCategory?.cycle && (
                <p className="text-xs text-gray-500 mt-1">
                  Auto-configured based on category requirements
                </p>
              )}
            </div>
          </div>

          {/* Rate Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isPercentage ? (
              <Input
                label={`Percentage Rate (${validationLimits.minPercentage}% - ${validationLimits.maxPercentage}%)`}
                type="number"
                name="percentageValue"
                placeholder="Enter percentage"
                value={percentageValue}
                onchange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateFormField('percentageValue', e.target.value)
                }
                errors={validationErrors.percentageValue}
                required
              />
            ) : (
              <CurrencyInput
                label={`Flat Rate Amount (XAF ${validationLimits.minFlatRate.toLocaleString()} - ${validationLimits.maxFlatRate.toLocaleString()})`}
                placeholder="Enter amount"
                value={flatRateValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateFormField('flatRateValue', e.target.value)
                }
                error={validationErrors.flatRateValue}
                required
              />
            )}

            {/* Salary Cap for Percentage */}
            {isPercentage && (
              <div>
                <SearchableSelect
                  label="Salary Cap"
                  selectedValue={salaryCap}
                  onChange={(value) => updateFormField('salaryCap', value)}
                  options={SALARY_CAP_OPTIONS}
                  placeholder="Select salary cap"
                  required
                  error={validationErrors.salaryCap}
                />
                {salaryCap === 'Custom' && (
                  <div className="mt-2">
                    <Input
                      label="Custom Salary Cap"
                      type="text"
                      name="customSalaryCap"
                      placeholder="Enter custom salary cap"
                      value={customSalaryCap}
                      onchange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateFormField('customSalaryCap', e.target.value)
                      }
                      errors={validationErrors.customSalaryCap}
                      required
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Special Category Notes */}
          {category === 'Meal Allowance' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-amber-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-amber-800">
                    Meal Allowance Note
                  </h4>
                  <p className="text-sm text-amber-700 mt-1">
                    This allowance is calculated per working day. The system
                    will automatically calculate based on working days per
                    month.
                  </p>
                </div>
              </div>
            </div>
          )}

          {category === 'Personal Income Tax' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">
                    Tax Brackets
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    0-62k (0%), 62k-150k (10%), 150k-500k (15%), 500k-1.5M
                    (25%), 1.5M+ (35%)
                  </p>
                </div>
              </div>
            </div>
          )}

          {category === 'Audiovisual Tax' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-purple-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-purple-800">
                    Tax Rates
                  </h4>
                  <p className="text-sm text-purple-700 mt-1">
                    0-50k (0), 50k-100k (750), 100k-200k (1950), 200k-300k
                    (3250), 300k-400k (4550), 400k-500k (5850), 500k-600k
                    (7150), 600k-700k (8450), 700k-800k (9750), 800k-900k
                    (11050), 900k-1M (12350), 1M+ (13000)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tax Configuration Section */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Tax Configuration
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Configure tax-related settings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Taxable Toggle */}
            <div>
              <Checkbox
                id="isTaxable"
                label="Taxable"
                checked={isTaxable}
                onChange={(checked) => updateFormField('isTaxable', checked)}
                className={
                  [
                    'Meal Allowance',
                    'Transport Allowance',
                    'Family Allowance',
                  ].includes(category)
                    ? 'opacity-50 pointer-events-none'
                    : ''
                }
              />
              {[
                'Meal Allowance',
                'Transport Allowance',
                'Family Allowance',
              ].includes(category) && (
                <p className="text-xs text-gray-500 mt-1">
                  This benefit is non-taxable by law
                </p>
              )}
            </div>

            {/* Tax Cap */}
            {isTaxable && (
              <CurrencyInput
                label="Tax Cap"
                placeholder="Enter tax cap amount"
                value={taxCap}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateFormField('taxCap', e.target.value)
                }
                error={validationErrors.taxCap}
              />
            )}
          </div>
        </div>

        {/* Advanced Options Section */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <button
              type="button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="flex items-center text-lg font-medium text-gray-900 hover:text-blue-600"
            >
              <svg
                className={`h-5 w-5 mr-2 transition-transform ${
                  showAdvancedOptions ? 'rotate-90' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              Advanced Options
            </button>
            <p className="text-sm text-gray-600 mt-1">
              Additional configuration options
            </p>
          </div>

          {showAdvancedOptions && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Max Amount */}
                <CurrencyInput
                  label="Maximum Amount"
                  placeholder="Enter maximum amount"
                  value={maxAmount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateFormField('maxAmount', e.target.value)
                  }
                  error={validationErrors.maxAmount}
                />

                {/* Expiry Date */}
                <CustomDatePicker
                  label="Expiry Date"
                  placeholder="Select expiry date"
                  value={expiryDate}
                  onChange={setExpiryDate}
                  errors={validationErrors.expiryDate}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Role-based Toggle */}
                <div>
                  <Checkbox
                    id="isRoleBased"
                    label="Role-based Benefit"
                    checked={isRoleBased}
                    onChange={(checked) =>
                      updateFormField('isRoleBased', checked)
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Apply this benefit only to specific roles
                  </p>
                </div>

                {/* Default Toggle */}
                <div>
                  <Checkbox
                    id="isDefault"
                    label="Default Benefit"
                    checked={isDefault}
                    onChange={(checked) =>
                      updateFormField('isDefault', checked)
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Apply this benefit to all employees by default
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Description Section */}
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-900">Description</h3>
            <p className="text-sm text-gray-600 mt-1">
              Provide additional details about this benefit
            </p>
          </div>

          <TextArea
            label="Description"
            name="description"
            placeholder="Enter benefit description"
            value={description}
            onchange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              updateFormField('description', e.target.value)
            }
            errors={validationErrors.description}
          />
        </div>

        {/* Form Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-2 bg-white border-t border-gray-200 flex justify-end space-x-3">
          <Button
            type="submit"
            text={
              isSubmitting
                ? isEditMode
                  ? 'Updating...'
                  : 'Adding...'
                : isEditMode
                ? 'Update Benefit'
                : 'Add Benefit'
            }
            disabled={isSubmitting || isLoading}
            onClick={handleFormSubmit}
          />
        </div>
      </div>
    </Slider>
  );
};

export default SliderBenefit;
