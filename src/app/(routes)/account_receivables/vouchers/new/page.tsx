'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import DocumentWorkspace from '@potta/components/document-workspace';
import {
  DocumentFormCard,
  DocumentFormFooter,
  DocumentFormShell,
  DocumentSectionTitle,
} from '@potta/components/document-form-layout';
import { Button as ShadcnButton } from '@/components/shadcn/button';

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

export default function NewVoucherPage() {
  const router = useRouter();
  const [voucherType, setVoucherType] = useState<VoucherType>('ROYALTY_POINTS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const createVoucherMutation = useCreateVoucher();

  const methods = useForm<FormData>({
    defaultValues: {
      type: VoucherTypeEnum.ROYALTY_POINTS,
    },
    mode: 'onBlur',
    shouldUnregister: false,
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
      setShowErrors(true);
      const count = Object.keys(newErrors).length;
      toast.error(
        count === 1
          ? 'There is 1 error in the form. Please fix it before publishing.'
          : `There are ${count} errors in the form. Please fix them before publishing.`
      );
      requestAnimationFrame(() => {
        document
          .querySelector('.error-field')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return false;
    }

    setShowErrors(false);
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
    <DocumentWorkspace
      title="New voucher"
      closeHref="/account_receivables/vouchers"
      bodyClassName="flex flex-col overflow-hidden"
    >
      <FormProvider {...methods}>
        <form
          id="new-voucher"
          onSubmit={methods.handleSubmit(onSubmit)}
          className="flex h-full min-h-0 flex-col bg-white"
        >
          <div className="min-h-0 flex-1 overflow-y-auto">
            <DocumentFormShell className="pb-6">
              <DocumentFormCard flush>
                <DocumentSectionTitle>Voucher type</DocumentSectionTitle>
                <VoucherTypeSelector
                  selectedType={voucherType}
                  onVoucherTypeChange={handleVoucherTypeChange}
                />
              </DocumentFormCard>

              <DocumentFormCard flush>
                <DocumentSectionTitle>Code</DocumentSectionTitle>
                <Code showErrors={showErrors} />
              </DocumentFormCard>

              <DocumentFormCard flush>
                <DocumentSectionTitle>Policy</DocumentSectionTitle>
                <Policy voucherType={voucherType} showErrors={showErrors} />
              </DocumentFormCard>

              <DocumentFormCard flush>
                <DocumentSectionTitle>Audience</DocumentSectionTitle>
                <Audience showErrors={showErrors} />
              </DocumentFormCard>

              <DocumentFormCard flush>
                <DocumentSectionTitle>Schedule</DocumentSectionTitle>
                <Scheduling showErrors={showErrors} />
              </DocumentFormCard>

              {showErrors && Object.keys(validationErrors).length > 0 ? (
                <div className="rounded-[2px] border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {Object.values(validationErrors).map((error) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              ) : null}
            </DocumentFormShell>
          </div>

          <DocumentFormFooter
            left={
              <ShadcnButton
                type="button"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                onClick={() => router.push('/account_receivables/vouchers')}
              >
                Cancel
              </ShadcnButton>
            }
            right={
              <ShadcnButton
                type="submit"
                className="bg-white text-foreground hover:bg-white/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Publishing…' : 'Publish'}
              </ShadcnButton>
            }
          />
        </form>
      </FormProvider>
    </DocumentWorkspace>
  );
}
