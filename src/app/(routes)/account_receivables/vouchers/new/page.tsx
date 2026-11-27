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
import { buildCreateVoucherPayload } from '../_utils/build-create-payload';
import DocumentWorkspace from '@potta/components/document-workspace';
import {
  DocumentFormCard,
  DocumentFormFooter,
  DocumentFormShell,
  DocumentSectionTitle,
} from '@potta/components/document-form-layout';
import { Button as ShadcnButton } from '@/components/shadcn/button';
import { cn } from '@potta/lib/utils';

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
    neverEnds?: boolean;
    specificDaysOnly: boolean;
    validDays?: Array<{
      day: string;
      startTime?: string;
      endTime?: string;
      allDay: boolean;
    }>;
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
  cashbackPercent?: number;
  cashbackMaximum?: number;
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

const STEPS = [
  { id: 'type', label: 'Type' },
  { id: 'code', label: 'Code' },
  { id: 'policy', label: 'Policy' },
  { id: 'audience', label: 'Audience' },
  { id: 'scheduling', label: 'Scheduling' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

const voucherTypeSpecificFields: Record<VoucherType, Array<keyof FormData>> = {
  DISCOUNT: ['discountPercent', 'discountAmount', 'maximumDiscount'],
  GIFT_CARD: ['balance'],
  ROYALTY_POINTS: ['loyaltyPoints', 'loyaltyAmount'],
  CASHBACK: ['cashbackPercent', 'cashbackMaximum', 'cashbackAmount'],
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
    proportional: ['loyaltyPoints', 'loyaltyAmount'],
  },
  CASHBACK: {
    fixed: ['cashbackPercent', 'cashbackMaximum'],
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
  const [step, setStep] = useState<StepId>('type');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const createVoucherMutation = useCreateVoucher();
  const stepIndex = STEPS.findIndex((item) => item.id === step);
  const isLastStep = stepIndex === STEPS.length - 1;

  const methods = useForm<FormData>({
    defaultValues: {
      type: VoucherTypeEnum.ROYALTY_POINTS,
      valueType: 'fixed',
      advancedCodeSettings: false,
      autoAddUsers: false,
      canJoinOnce: false,
      scheduling: {
        specificDaysOnly: false,
        neverEnds: false,
      },
      audience: {
        segment: '',
        autoAddUsers: false,
        canJoinOnce: false,
      },
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
    setValue('valueType', 'fixed');
    unregisterIrrelevantFields(type);
    setValidationErrors({});
    setShowErrors(false);
  };

  const validateStep = (current: StepId): Record<string, string> => {
    const next: Record<string, string> = {};

    if (current === 'type') {
      if (!getValues('type')) next.type = 'Voucher type is required';
    }

    if (current === 'code') {
      const code = getValues('code');
      const useAdvancedSettings = getValues('advancedCodeSettings');
      if (!code && !useAdvancedSettings) {
        next.code = 'Enter a code, or turn on advanced settings';
      }
      if (useAdvancedSettings) {
        const codeSettings = getValues('codeSettings') || {};
        if (!codeSettings.prefix) next['codeSettings.prefix'] = 'Code prefix is required';
        if (!codeSettings.postfix) next['codeSettings.postfix'] = 'Code postfix is required';
        if (!codeSettings.length) next['codeSettings.length'] = 'Code length is required';
        if (!codeSettings.pattern) next['codeSettings.pattern'] = 'Pattern is required';
        if (!codeSettings.characterSet) {
          next['codeSettings.characterSet'] = 'Character set is required';
        }
      }
      if (!getValues('programCardPrefix')) {
        next.programCardPrefix = 'Program card prefix is required';
      }
    }

    if (current === 'policy') {
      const currentValueType =
        voucherType === 'CASHBACK' || voucherType === 'GIFT_CARD'
          ? 'fixed'
          : getValues('valueType') || 'fixed';
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
          next[field] = `${readable} is required`;
        }
      }

      const minimumPurchase = getValues('minimumPurchase');
      const maximumDiscount = getValues('maximumDiscount');
      if (minimumPurchase && maximumDiscount) {
        const minPurchase = parseFloat(String(minimumPurchase));
        const maxDiscount = parseFloat(String(maximumDiscount));
        if (
          !isNaN(minPurchase) &&
          !isNaN(maxDiscount) &&
          maxDiscount > minPurchase
        ) {
          next.maximumDiscount =
            'Maximum discount cannot be greater than minimum purchase amount';
        }
      }
    }

    if (current === 'audience') {
      if (!getValues('audience.segment')) {
        next['audience.segment'] = 'Audience is required';
      }
    }

    if (current === 'scheduling') {
      if (!getValues('scheduling.programStartDate')) {
        next['scheduling.programStartDate'] = 'Program start date is required';
      }
      const neverEnds = getValues('scheduling.neverEnds');
      if (!neverEnds && !getValues('scheduling.programEndDate')) {
        next['scheduling.programEndDate'] = 'Program end date is required';
      }
    }

    return next;
  };

  const goNext = () => {
    const errors = validateStep(step);
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      toast.error('Please fix the required fields before continuing.');
      requestAnimationFrame(() => {
        document
          .querySelector('.error-field')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }
    setShowErrors(false);
    setValidationErrors({});
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next.id);
  };

  const goBack = () => {
    setShowErrors(false);
    setValidationErrors({});
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev.id);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const errors = validateStep('scheduling');
      setValidationErrors(errors);
      if (Object.keys(errors).length > 0) {
        setShowErrors(true);
        toast.error('Please fix the required fields before publishing.');
        return;
      }

      setIsSubmitting(true);
      const payload = buildCreateVoucherPayload(data);
      await createVoucherMutation.mutateAsync(payload);
      toast.success('Voucher created successfully!');
      router.push('/account_receivables/vouchers');
    } catch (error: any) {
      console.error('Error creating voucher:', error);
      const apiMessage =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message;
      const text = Array.isArray(apiMessage)
        ? apiMessage.join('. ')
        : typeof apiMessage === 'string'
          ? apiMessage
          : 'Failed to create voucher. Please try again.';
      toast.error(text);
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
          <div className="flex shrink-0 gap-6 overflow-x-auto border-b border-black/[0.08] px-6 text-sm">
            {STEPS.map((item, index) => {
              const reached = index <= stepIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (index < stepIndex) {
                      setShowErrors(false);
                      setValidationErrors({});
                      setStep(item.id);
                    }
                  }}
                  className={cn(
                    'border-b-2 py-3',
                    step === item.id
                      ? 'border-primary font-medium text-primary'
                      : reached
                        ? 'border-transparent text-foreground'
                        : 'border-transparent text-muted-foreground',
                  )}
                >
                  {index + 1}. {item.label}
                </button>
              );
            })}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <DocumentFormShell className="pb-6">
              <DocumentFormCard flush>
                <DocumentSectionTitle>
                  {STEPS[stepIndex]?.label}
                </DocumentSectionTitle>

                <div className={step === 'type' ? undefined : 'hidden'}>
                  <VoucherTypeSelector
                    selectedType={voucherType}
                    onVoucherTypeChange={handleVoucherTypeChange}
                  />
                </div>
                <div className={step === 'code' ? undefined : 'hidden'}>
                  <Code showErrors={showErrors && step === 'code'} />
                </div>
                <div className={step === 'policy' ? undefined : 'hidden'}>
                  <Policy
                    voucherType={voucherType}
                    showErrors={showErrors && step === 'policy'}
                  />
                </div>
                <div className={step === 'audience' ? undefined : 'hidden'}>
                  <Audience showErrors={showErrors && step === 'audience'} />
                </div>
                <div className={step === 'scheduling' ? undefined : 'hidden'}>
                  <Scheduling showErrors={showErrors && step === 'scheduling'} />
                </div>

                {showErrors && Object.keys(validationErrors).length > 0 ? (
                  <div className="mt-6 rounded-[2px] border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {Object.values(validationErrors).map((error) => (
                      <p key={error}>{error}</p>
                    ))}
                  </div>
                ) : null}
              </DocumentFormCard>
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
              <>
                {stepIndex > 0 ? (
                  <ShadcnButton
                    type="button"
                    variant="outline"
                    className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    onClick={goBack}
                  >
                    Back
                  </ShadcnButton>
                ) : null}
                {isLastStep ? (
                  <ShadcnButton
                    type="submit"
                    className="bg-white text-foreground hover:bg-white/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Publishing…' : 'Publish'}
                  </ShadcnButton>
                ) : (
                  <ShadcnButton
                    type="button"
                    className="bg-white text-foreground hover:bg-white/90"
                    onClick={goNext}
                  >
                    Next
                  </ShadcnButton>
                )}
              </>
            }
          />
        </form>
      </FormProvider>
    </DocumentWorkspace>
  );
}
