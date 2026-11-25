'use client';

import { useState } from 'react';
import {
  FormProvider,
  useForm,
  FieldPath,
} from 'react-hook-form';
import { toast } from 'sonner';
import VoucherTypeSelector, { VoucherType } from './components/left';
import Policy from './components/policy.';
import Audience from './components/audience';
import Scheduling from './components/scheduling';
import Code from './components/code';
import { useCreateVoucher } from '../_hooks/hooks';
import { Loader2 } from 'lucide-react';

enum VoucherTypeEnum {
  COUPON = 'DISCOUNT',
  GIFT_CARD = 'GIFT_CARD',
  ROYALTY_POINTS = 'ROYALTY_POINTS',
  CASHBACK = 'CASHBACK',
}

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
  discountAmount?: number;
  discountPercent?: number;
  balance?: number;
  loyaltyPoints?: number;
  loyaltyAmount?: number;
  loyaltyPointsValue?: number;
  cashbackPercent?: number;
  cashbackAmount?: number;
  code?: string;
  programCardPrefix: string;
  codeSettings?: {
    length: number;
    prefix: string;
    postfix: string;
    pattern: string;
    characterSet: string;
  };
  minimumPurchase?: string;
  maximumDiscount?: string;
  [key: string]: any;
};

const voucherTypeSpecificFields: Record<VoucherType, Array<keyof FormData>> = {
  DISCOUNT: ['discountPercent', 'discountAmount'],
  GIFT_CARD: ['balance'],
  ROYALTY_POINTS: ['loyaltyPoints', 'loyaltyAmount', 'loyaltyPointsValue'],
  CASHBACK: ['cashbackPercent', 'cashbackAmount'],
};

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

const commonFields: Array<keyof FormData> = [
  'name',
  'description',
  'type',
  'startDate',
  'endDate',
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-gray-200 pb-8 last:border-b-0">
      <h2 className="mb-4 text-lg font-medium text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export default function NewVoucherPage() {
  const [voucherType, setVoucherType] = useState<VoucherType>('ROYALTY_POINTS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const createVoucherMutation = useCreateVoucher();

  const methods = useForm<FormData>({
    defaultValues: {
      type: VoucherTypeEnum.ROYALTY_POINTS,
    },
    mode: 'onBlur',
  });

  const { unregister, setValue, getValues } = methods;

  const unregisterIrrelevantFields = (newType: VoucherType) => {
    const allTypeSpecificFields = Object.values(
      voucherTypeSpecificFields
    ).flat();
    const fieldsToKeep = [
      ...commonFields,
      ...(voucherTypeSpecificFields[newType] || []),
    ];

    allTypeSpecificFields.forEach((field) => {
      if (!fieldsToKeep.includes(field)) {
        unregister(field as FieldPath<FormData>);
      }
    });
  };

  const handleVoucherTypeChange = (type: VoucherType) => {
    setVoucherType(type);

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
    unregisterIrrelevantFields(type);
    setValidationErrors({});
  };

  const removeEmptyValues = (obj: any): any => {
    if (obj === null || obj === undefined) return undefined;

    if (Array.isArray(obj)) {
      const filteredArray = obj
        .map((item) =>
          typeof item === 'object' ? removeEmptyValues(item) : item
        )
        .filter((item) => item !== null && item !== undefined && item !== '');
      return filteredArray.length > 0 ? filteredArray : undefined;
    }

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

    return obj === '' ? undefined : obj;
  };

  /** Validate the whole form before Publish (not step-by-step). */
  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};

    const currentValueType = getValues('valueType') || 'fixed';
    const policyFields =
      policyRequiredFieldsByType[voucherType]?.[currentValueType] || [];
    for (const field of policyFields) {
      const value = getValues(field as any);
      if (!value && value !== 0) {
        const fieldName = field.split('.').pop() || field;
        const readable = fieldName
          .replace(/([A-Z])/g, ' $1')
          .toLowerCase()
          .replace(/^\w/, (c) => c.toUpperCase());
        newErrors[field] = `${readable} is required`;
      }
    }

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
      }
    }

    const code = getValues('code');
    const useAdvancedSettings = getValues('advancedCodeSettings');
    if (!code && !useAdvancedSettings) {
      newErrors['code'] = 'Either a code or code settings must be provided';
    }
    if (useAdvancedSettings) {
      const codeSettings = getValues('codeSettings');
      if (!codeSettings || !codeSettings.length) {
        newErrors['codeSettings.length'] =
          'Code length is required when using advanced settings';
      }
    }
    const programCardPrefix = getValues('programCardPrefix');
    if (!programCardPrefix) {
      newErrors['programCardPrefix'] = 'Program card prefix is required';
    }

    const segment = getValues('audience.segment');
    if (!segment) {
      newErrors['audience.segment'] = 'Audience segment is required';
    }

    const programStartDate = getValues('scheduling.programStartDate');
    if (!programStartDate) {
      newErrors['scheduling.programStartDate'] = 'Program start date is required';
    }

    setValidationErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const count = Object.keys(newErrors).length;
      toast.error(
        count === 1
          ? 'There is 1 error in the form. Please fix it before publishing.'
          : `There are ${count} errors in the form. Please fix them before publishing.`
      );
      return false;
    }

    return true;
  };

  const onSubmit = async (data: FormData) => {
    try {
      setValidationErrors({});

      if (!validateAll()) {
        return;
      }

      setIsSubmitting(true);

      let filteredData = removeEmptyValues(data);
      const { voucherType: _vt, ...dataWithoutVoucherType } = filteredData;
      filteredData = dataWithoutVoucherType;

      if (filteredData.minimumPurchase && filteredData.minimumPurchase !== '') {
        filteredData.minimumPurchase = parseFloat(filteredData.minimumPurchase);
      }
      if (filteredData.maximumDiscount && filteredData.maximumDiscount !== '') {
        filteredData.maximumDiscount = parseFloat(filteredData.maximumDiscount);
      }

      await createVoucherMutation.mutateAsync(filteredData);
      toast.success('Voucher created successfully!');
    } catch (error) {
      console.error('Error creating voucher:', error);
      if (error instanceof Error) {
        toast.error(`Failed to create voucher: ${error.message}`);
      } else {
        toast.error('Failed to create voucher. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-[92.7vh] overflow-hidden p-4 md:p-5">
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="flex w-full flex-col"
        >
          <div className="mx-auto w-full max-w-4xl flex-1 overflow-y-auto bg-white pb-24">
            <div className="flex flex-col gap-8 p-4 md:p-6">
              <Section title="Type">
                <VoucherTypeSelector
                  selectedType={voucherType}
                  onVoucherTypeChange={handleVoucherTypeChange}
                />
              </Section>

              <Section title="Code">
                <Code />
              </Section>

              <Section title="Policy">
                <Policy voucherType={voucherType} />
              </Section>

              <Section title="Audience">
                <Audience />
              </Section>

              <Section title="Scheduling">
                <Scheduling />
              </Section>
            </div>

            {Object.keys(validationErrors).length > 0 && (
              <div className="mx-4 mb-6 border border-red-200 bg-red-50 p-3 md:mx-6">
                <h4 className="mb-2 font-medium text-red-600">
                  Please fix the following errors:
                </h4>
                <ul className="list-disc pl-5 text-sm text-red-500">
                  {Object.values(validationErrors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white p-2">
            <div className="mx-auto flex max-w-4xl justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center justify-center px-4 py-2 text-white ${
                  isSubmitting
                    ? 'cursor-not-allowed bg-gray-400'
                    : 'bg-green-700 hover:bg-green-800'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  'Publish'
                )}
              </button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
