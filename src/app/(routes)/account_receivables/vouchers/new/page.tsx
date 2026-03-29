'use client';

import { useState, useEffect, useContext } from 'react';
import {
  FormProvider,
  useForm,
  FieldPath,
  UnpackNestedValue,
} from 'react-hook-form';
import { toast, Toaster } from 'react-hot-toast';
import VoucherTypeSelector, { VoucherType, TabType } from './components/left';
import Policy from './components/policy.';
import Audience from './components/audience';
import Scheduling from './components/scheduling';
import Code from './components/code';
import { useCreateVoucher } from '../_hooks/hooks'; // Import the hook
import { ContextData } from '../../../../../components/providers/DataProvider';
import { Loader2 } from 'lucide-react';

// Define a new type that includes all possible tab values
type AllTabTypes = TabType | 'VoucherType';

// Define an enum for voucher types to match your payload
enum VoucherTypeEnum {
  COUPON = 'DISCOUNT',
  GIFT_CARD = 'GIFT_CARD',
  ROYALTY_POINTS = 'ROYALTY_POINTS',
  CASHBACK = 'CASHBACK',
}

// Define the form data type
type FormData = {
  type: VoucherTypeEnum;
  usageLimit?: number;
  scheduling: {
    programStartDate: string;
    programEndDate?: string;
    specificDaysOnly: boolean;
    specificDays?: [
      {
        day: string;
        startTime?: string;
        endTime?: string;
        allDay: boolean;
      }
    ];
  };
  audience: {
    segment: string;
    autoAddUsers: boolean;
    canJoinOnce: boolean;
  };
  // Discount fields
  discountAmount?: number;
  discountPercent?: number;

  // Gift Card fields
  balance?: number;

  // Royalty Points fields
  loyaltyPoints?: number;
  loyaltyAmount?: number;
  loyaltyPointsValue?: number;

  // Cashback fields
  cashbackPercent?: number;
  cashbackAmount?: number;

  // Code fields
  code?: string;
  programCardPrefix: string;
  codeSettings?: {
    length: number;
    prefix: string;
    postfix: string;
    pattern: string;
    characterSet: string;
  };

  // Additional Settings
  minimumPurchase?: string;
  maximumDiscount?: string;

  // Other fields can be added as needed
  [key: string]: any;
};

// Define fields specific to each voucher type
const voucherTypeSpecificFields: Record<VoucherType, Array<keyof FormData>> = {
  DISCOUNT: ['discountPercent', 'discountAmount'],
  GIFT_CARD: ['balance'],
  ROYALTY_POINTS: ['loyaltyPoints', 'loyaltyAmount', 'loyaltyPointsValue'],
  CASHBACK: ['cashbackPercent', 'cashbackAmount'],
};

// Define required fields for each tab
const requiredFieldsByTab: Record<AllTabTypes, Array<string>> = {
  VoucherType: [], // No required fields on voucher type selection
  Policy: [], // Will be dynamically determined based on voucher type
  Audience: ['audience.segment'],
  Scheduling: ['scheduling.programStartDate'],
  Code: [], // Special validation for Code tab
};

// Define required fields for each voucher type in the Policy tab
const policyRequiredFieldsByType: Record<
  VoucherType,
  Record<string, Array<string>>
> = {
  DISCOUNT: {
    fixed: ['discountAmount'],
    proportional: ['discountPercent'],
  },
  GIFT_CARD: {
    fixed: ['balance'],
  },
  ROYALTY_POINTS: {
    fixed: ['loyaltyPoints'],
    proportional: ['loyaltyAmount', 'loyaltyPointsValue'],
  },
  CASHBACK: {
    fixed: ['cashbackAmount'],
    proportional: ['cashbackAmount', 'cashbackPercent'],
  },
};

// Define common fields that should be kept for all voucher types
const commonFields: Array<keyof FormData> = [
  'name',
  'description',
  'type',
  'startDate',
  'endDate',
];

export default function NewVoucherPage() {
  const context = useContext(ContextData);
  const [activeTab, setActiveTab] = useState<AllTabTypes>('VoucherType');
  const [voucherType, setVoucherType] = useState<VoucherType>('ROYALTY_POINTS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [tabsWithErrors, setTabsWithErrors] = useState<AllTabTypes[]>([]);

  // Initialize the create voucher mutation hook
  const createVoucherMutation = useCreateVoucher();

  // Update form structure to match your desired payload
  const methods = useForm<FormData>({
    defaultValues: {
      type: VoucherTypeEnum.ROYALTY_POINTS, // Default to ROYALTY_POINTS
    },
    mode: 'onBlur', // Validate on blur
  });

  const {
    unregister,
    setValue,
    getValues,
    trigger,
    watch,
    formState: { errors },
  } = methods;

  // Watch for valueType changes
  const valueType = watch('valueType') || 'fixed';

  // Function to unregister fields not applicable to the current voucher type
  const unregisterIrrelevantFields = (newType: VoucherType) => {
    // Get all voucher type specific fields
    const allTypeSpecificFields = Object.values(
      voucherTypeSpecificFields
    ).flat();

    // Get fields that should be kept for the new type
    const fieldsToKeep = [
      ...commonFields,
      ...(voucherTypeSpecificFields[newType] || []),
    ];

    // Unregister fields that aren't needed for the new type
    allTypeSpecificFields.forEach((field) => {
      if (!fieldsToKeep.includes(field)) {
        unregister(field as FieldPath<FormData>);
      }
    });
  };

  const handleVoucherTypeChange = (type: VoucherType) => {
    setVoucherType(type);

    // Update the form's voucher type when it changes
    let voucherTypeEnum: VoucherTypeEnum;

    switch (type) {
      case 'ROYALTY_POINTS':
        voucherTypeEnum = VoucherTypeEnum.ROYALTY_POINTS;
        break;
      case 'DISCOUNT':
        voucherTypeEnum = VoucherTypeEnum.COUPON;
        break;
      case 'GIFT_CARD':
        voucherTypeEnum = VoucherTypeEnum.GIFT_CARD;
        break;
      case 'CASHBACK':
        voucherTypeEnum = VoucherTypeEnum.CASHBACK;
        break;
      default:
        voucherTypeEnum = VoucherTypeEnum.ROYALTY_POINTS;
    }

    setValue('type', voucherTypeEnum);

    // Unregister fields not applicable to the new voucher type
    unregisterIrrelevantFields(type);

    // Clear validation errors
    setValidationErrors({});
    setTabsWithErrors([]);
  };

  const handleTabChange = (tab: AllTabTypes) => {
    // Allow free navigation between tabs
    setActiveTab(tab);
  };

  // Helper function to remove empty values recursively
  const removeEmptyValues = (obj: any): any => {
    if (obj === null || obj === undefined) return undefined;

    // Handle arrays
    if (Array.isArray(obj)) {
      const filteredArray = obj
        .map((item) =>
          typeof item === 'object' ? removeEmptyValues(item) : item
        )
        .filter((item) => item !== null && item !== undefined && item !== '');

      return filteredArray.length > 0 ? filteredArray : undefined;
    }

    // Handle objects
    if (typeof obj === 'object') {
      const filteredObj = Object.entries(obj).reduce((acc, [key, value]) => {
        const filteredValue = removeEmptyValues(value);

        if (filteredValue !== undefined) {
          acc[key] = filteredValue;
        }

        return acc;
      }, {} as Record<string, any>);

      return Object.keys(filteredObj).length > 0 ? filteredObj : undefined;
    }

    // Handle primitive values
    return obj === '' ? undefined : obj;
  };

  // Validate the current tab
  const validateCurrentTab = async (tab: AllTabTypes): Promise<boolean> => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    // Get required fields for the current tab
    let requiredFields: string[] = [...(requiredFieldsByTab[tab] || [])];

    // For Policy tab, get required fields based on voucher type and value type
    if (tab === 'Policy') {
      const currentValueType = getValues('valueType') || 'fixed';
      const typeSpecificFields =
        policyRequiredFieldsByType[voucherType]?.[currentValueType] || [];
      requiredFields = [...requiredFields, ...typeSpecificFields];

      // Validate additional settings if provided
      const minimumPurchase = getValues('minimumPurchase');
      const maximumDiscount = getValues('maximumDiscount');

      if (minimumPurchase && maximumDiscount) {
        const minPurchase = parseFloat(minimumPurchase);
        const maxDiscount = parseFloat(maximumDiscount);

        if (
          !isNaN(minPurchase) &&
          !isNaN(maxDiscount) &&
          maxDiscount > minPurchase
        ) {
          newErrors['maximumDiscount'] =
            'Maximum discount cannot be greater than minimum purchase amount';
          isValid = false;
        }
      }
    }

    // For Code tab, validate that either code or code settings are provided
    if (tab === 'Code') {
      const code = getValues('code');
      const useAdvancedSettings = getValues('advancedCodeSettings');

      if (!code && !useAdvancedSettings) {
        newErrors['code'] = 'Either a code or code settings must be provided';
        isValid = false;
      }

      if (useAdvancedSettings) {
        const codeSettings = getValues('codeSettings');
        if (!codeSettings || !codeSettings.length) {
          newErrors['codeSettings.length'] =
            'Code length is required when using advanced settings';
          isValid = false;
        }
      }

      // Check for programCardPrefix which is required in all cases
      const programCardPrefix = getValues('programCardPrefix');
      if (!programCardPrefix) {
        newErrors['programCardPrefix'] = 'Program card prefix is required';
        isValid = false;
      }
    } else {
      // For other tabs, validate each required field
      for (const field of requiredFields) {
        const value = getValues(field as any);
        if (!value && value !== 0) {
          // Allow 0 as a valid value
          // Get human-readable field name
          const fieldName = field.split('.').pop() || field;
          const readableFieldName = fieldName
            .replace(/([A-Z])/g, ' $1')
            .toLowerCase()
            .replace(/^\w/, (c) => c.toUpperCase());

          newErrors[field] = `${readableFieldName} is required`;
          isValid = false;
        }
      }
    }

    // Update validation errors
    setValidationErrors((prev) => ({ ...prev, ...newErrors }));

    // Update tabs with errors
    if (!isValid) {
      setTabsWithErrors((prev) => (prev.includes(tab) ? prev : [...prev, tab]));
    } else {
      setTabsWithErrors((prev) => prev.filter((t) => t !== tab));
    }

    return isValid;
  };

  // Validate all tabs before submission
  const validateAllTabs = async (): Promise<boolean> => {
    // Validate each tab
    const tabs: AllTabTypes[] = ['Code', 'Policy', 'Audience', 'Scheduling'];

    let isValid = true;
    const allErrors: Record<string, string> = {};
    const tabsWithErrorsFound: AllTabTypes[] = [];

    for (const tab of tabs) {
      const tabValid = await validateCurrentTab(tab);
      if (!tabValid) {
        isValid = false;
        tabsWithErrorsFound.push(tab);

        // Collect errors from this tab
        Object.assign(allErrors, validationErrors);
      }
    }

    // Update validation errors with all collected errors
    setValidationErrors(allErrors);
    setTabsWithErrors(tabsWithErrorsFound);

    // If there are errors, navigate to the first tab with errors
    if (tabsWithErrorsFound.length > 0) {
      setActiveTab(tabsWithErrorsFound[0]);

      // Show toast with error message
      const errorCount = Object.keys(allErrors).length;
      const errorMessage =
        errorCount === 1
          ? 'There is 1 error in the form. Navigating to the tab with the error.'
          : `There are errors in the form. Navigating to the first tab with errors.`;

      toast.error(errorMessage);
    }

    return isValid;
  };

  // Submit handler
  const onSubmit = async (data: FormData) => {
    try {
      // Clear previous validation errors
      setValidationErrors({});

      // Validate all tabs first
      const isValid = await validateAllTabs();
      if (!isValid) {
        return;
      }

      // Set submitting state to show loading indicator
      setIsSubmitting(true);

      // Filter out empty values before submission
      let filteredData = removeEmptyValues(data);

      // Fix the API error by ensuring voucherType is not sent
      // The type field is already set correctly as VoucherTypeEnum
      const { voucherType, ...dataWithoutVoucherType } = filteredData;
      filteredData = dataWithoutVoucherType;

      // Convert currency string values to numbers for API
      if (filteredData.minimumPurchase && filteredData.minimumPurchase !== '') {
        filteredData.minimumPurchase = parseFloat(filteredData.minimumPurchase);
      }
      if (filteredData.maximumDiscount && filteredData.maximumDiscount !== '') {
        filteredData.maximumDiscount = parseFloat(filteredData.maximumDiscount);
      }

      console.log('Raw form data:', data);
      console.log('Filtered form data:', filteredData);

      // Show loading toast

      // Call the mutation to create the voucher
      await createVoucherMutation.mutateAsync(filteredData);

      // Dismiss loading toast and show success message

      toast.success('Voucher created successfully!');

      // You can add navigation here if needed
      // router.push('/vouchers');
    } catch (error) {
      // Show error message
      console.error('Error creating voucher:', error);

      // Show different error messages based on error type
      if (error instanceof Error) {
        toast.error(`Failed to create voucher: ${error.message}`);
      } else {
        toast.error('Failed to create voucher. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Effect to handle tab-specific field unregistration
  useEffect(() => {
    // You can add logic here to unregister fields when tabs change if needed
    if (activeTab !== 'Code') {
      const advancedCodeSettings = getValues('advancedCodeSettings');
      if (advancedCodeSettings) {
        unregister('code' as FieldPath<FormData>);
      }
    }
  }, [activeTab, unregister, getValues]);

  const tabs: TabType[] = ['Code', 'Policy', 'Audience', 'Scheduling'];

  return (
    <div
      className={`${
        context?.layoutMode === 'sidebar' ? 'px-8' : 'px-5'
      } h-[92.7vh] overflow-y-auto flex`}
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="flex w-full">
          {/* Sidebar Navigation - Fixed width */}
          <div className="w-[150px] min-w-[150px] border-r border-gray-200 flex-shrink-0 bg-white">
            <nav className="flex flex-col space-y-1">
              <button
                className={`py-2 text-left ${
                  activeTab === 'VoucherType'
                    ? 'text-green-600 font-medium border-l-4 border-green-600 pl-2'
                    : 'text-gray-700 pl-2'
                } hover:text-green-600 transition-colors`}
                onClick={() => handleTabChange('VoucherType')}
                type="button"
              >
                Voucher Type
              </button>
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`py-2 text-left ${
                    activeTab === tab
                      ? 'text-green-600 font-medium border-l-2 border-green-600 pl-2'
                      : tabsWithErrors.includes(tab)
                      ? 'text-red-600 font-medium pl-2'
                      : 'text-gray-700 pl-2'
                  } hover:text-green-600 transition-colors`}
                  onClick={() => handleTabChange(tab)}
                  type="button"
                >
                  {tab} {tabsWithErrors.includes(tab) && '⚠️'}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content Area - Takes remaining width */}
          <div className="flex-1 flex flex-col">
            {/* Tab-specific content */}
            <div className="flex-1">
              {activeTab === 'VoucherType' ? (
                <VoucherTypeSelector
                  selectedType={voucherType}
                  onVoucherTypeChange={handleVoucherTypeChange}
                />
              ) : activeTab === 'Code' ? (
                <Code />
              ) : activeTab === 'Policy' ? (
                <Policy voucherType={voucherType} />
              ) : activeTab === 'Audience' ? (
                <Audience />
              ) : activeTab === 'Scheduling' ? (
                <Scheduling />
              ) : (
                <div>Eligibility Content</div>
              )}
            </div>

            {/* Validation Error Summary */}
            {Object.keys(validationErrors).length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200">
                <h4 className="text-red-600 font-medium mb-2">
                  Please fix the following errors:
                </h4>
                <ul className="list-disc pl-5 text-red-500 text-sm">
                  {Object.values(validationErrors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="fixed bottom-0 left-0 right-0 p-2 bg-white border-t border-gray-200 flex justify-end space-x-3">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={async () => {
                    const isValid = await validateCurrentTab(activeTab);
                    if (!isValid) {
                      toast.error(
                        `There are errors in the ${activeTab} tab. Please fix them.`
                      );
                    } else {
                      toast.success(`${activeTab} tab is valid!`);
                    }
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Validate Current Tab
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-700 hover:bg-green-800'
                  } text-white flex items-center justify-center`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
