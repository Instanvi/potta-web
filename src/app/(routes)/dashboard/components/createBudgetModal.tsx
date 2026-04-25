'use client';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as yup from 'yup';
import Input from '../../../../components/input';
import Select from '../../../../components/select';
import CurrencyInput from '../../../../components/currencyInput';
import Button from '../../../../components/button';
import SearchableSelect, {
  Option,
} from '../../../../components/searchableSelect';
import { CalendarIcon, Info } from 'lucide-react';
import { DateInput } from '../../../../components/customDatePicker';
import { CalendarDate } from '@internationalized/date';
import axios from 'config/axios.config';
import toast from 'react-hot-toast';
import { useCreateBudget } from '../../account_payables/budgets/hooks/useCreateBudget';

type ApprovalRequirement = 'one' | 'at_least' | 'all';
type RecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';

interface Role {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role?: {
    id: string;
    name: string;
  };
}

interface CreateBudgetModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  onSave: (budgetData: {
    name: string;
    description?: string;
    totalAmount: number;
    startDate: string;
    endDate: string;
    organizationId: string;
    branchId: string;
    policies: string[];
    recurrenceType?: string;
    recurrenceInterval?: number;
    recurrenceEndDate?: string;
  }) => void;
}

const validationSchema = yup.object().shape({
  name: yup.string().required('Budget name is required'),
  description: yup.string(),
  goal: yup.string().required('Budget goal is required'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup
    .date()
    .required('End date is required')
    .min(yup.ref('startDate'), 'End date must be after start date'),
  policies: yup
    .array()
    .of(
      yup
        .string()
        .matches(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
          'Invalid policy UUID format'
        )
    )
    .min(1, 'At least one policy is required')
    .required('Policy selection is required'),
});

type FormData = yup.InferType<typeof validationSchema>;

const CreateBudgetModal: React.FC<CreateBudgetModalProps> = ({
  open,
  setOpen,
  onSave,
}) => {
  const [budgetName, setBudgetName] = useState('');
  const [budgetDescription, setBudgetDescription] = useState('');
  const [budgetGoal, setBudgetGoal] = useState('');
  const [budgetRecurrence, setBudgetRecurrence] =
    useState<RecurrenceType>('MONTHLY');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1))
  );
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<string[]>([]);

  // Hardcoded IDs
  const organizationId = 'f7b1b3b0-0b1b-4b3b-8b1b-0b1b3b0b1b3c';
  const branchId = 'f7b1b3b0-0b1b-4b3b-8b1b-0b1b3b0b1b3b';

  // Form errors
  const [errors, setErrors] = useState<{
    name?: string;
    goal?: string;
    startDate?: string;
    endDate?: string;
    policies?: string;
  }>({});

  // Use our custom hooks
  const {
    createBudget,
    loading: createBudgetLoading,
    error: createBudgetError,
  } = useCreateBudget();

  // Fetch policies
  const {
    data: policiesData,
    isLoading: policiesLoading,
    error: policiesError,
  } = useQuery({
    queryKey: ['policies'],
    queryFn: async () => {
      const response = await axios.get('/policies/all', {
        params: {
          page: 1,
          limit: 100,
          sortBy: ['name:ASC'],
          branchId,
        },
      });
      return response.data.data || [];
    },
  });

  // Handle animation when modal opens or closes
  useEffect(() => {
    if (open) {
      // First make the component visible
      setIsVisible(true);
      // Then trigger the animation after a small delay to ensure the initial state is rendered
      setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
    } else {
      // Start the closing animation
      setIsAnimating(false);
      // Delay the actual hiding to allow animation to complete
      setTimeout(() => {
        setIsVisible(false);
      }, 300); // Match this with the CSS transition duration
      // Allow body to scroll when modal is closed
      document.body.style.overflow = 'auto';
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  const handleClose = () => {
    // Just set open to false, the useEffect will handle the animation
    setOpen(false);
  };

  const validateForm = async () => {
    try {
      const formData: FormData = {
        name: budgetName,
        description: budgetDescription,
        goal: budgetGoal,
        startDate,
        endDate,
        policies: selectedPolicyIds,
      };

      await validationSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const validationErrors: { [key: string]: string } = {};
        err.inner.forEach((error) => {
          if (error.path) {
            validationErrors[error.path] = error.message;
          }
        });
        setErrors(validationErrors);
      }
      return false;
    }
  };

  const handleSave = async () => {
    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    const numericGoal = parseFloat(budgetGoal.replace(/[^0-9.]/g, ''));

    try {
      const basePayload = {
        name: budgetName,
        description: budgetDescription,
        totalAmount: numericGoal,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        organizationId,
        branchId,
        policies: selectedPolicyIds,
      };

      const payload = isRecurring
        ? {
            ...basePayload,
            recurrenceType: budgetRecurrence,
            recurrenceInterval: 1,
            recurrenceEndDate: endDate.toISOString(),
          }
        : basePayload;

      await createBudget(payload);

      toast.success('Budget created successfully!');

      onSave({
        name: budgetName,
        description: budgetDescription,
        totalAmount: numericGoal,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        organizationId,
        branchId,
        policies: selectedPolicyIds,
        ...(isRecurring && {
          recurrenceType: budgetRecurrence,
          recurrenceInterval: 1,
          recurrenceEndDate: endDate.toISOString(),
        }),
      });

      // Reset form
      setBudgetName('');
      setBudgetDescription('');
      setBudgetGoal('');
      setBudgetRecurrence('MONTHLY');
      setIsRecurring(false);
      setSelectedPolicyIds([]);
      setErrors({});

      handleClose();
    } catch (err) {
      console.error('Error creating budget:', err);
      toast.error('Failed to create budget. Please try again.');
    }
  };

  // Prepare policy options
  const policyOptions = React.useMemo(() => {
    if (!policiesData) return [];
    return policiesData.map((policy: any) => ({
      value: policy.uuid,
      label: policy.name,
    }));
  }, [policiesData]);

  const recurrenceOptions = [
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'QUARTERLY', label: 'Quarterly' },
    { value: 'ANNUALLY', label: 'Yearly' },
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      ></div>

      {/* Modal Container */}
      <div
        className={`fixed inset-0 bg-white transition-transform duration-300 ease-in-out transform ${
          isAnimating ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-medium text-gray-900">
            Create New Budget
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div
          className="p-6 space-y-6 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 140px)' }}
        >
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="w-full">
              <Input
                type="text"
                label="Budget Name"
                name="budgetName"
                placeholder="Enter budget name"
                value={budgetName}
                onchange={(e) => {
                  setBudgetName(e.target.value);
                  if (errors.name) {
                    setErrors({ ...errors, name: undefined });
                  }
                }}
                required
                errors={errors.name ? { message: errors.name } : undefined}
              />
            </div>

            <div className="w-full">
              <Input
                label="Description"
                type="text"
                name="budgetDescription"
                placeholder="Enter budget description"
                value={budgetDescription}
                onchange={(e) => setBudgetDescription(e.target.value)}
              />
            </div>

            <div className="w-full">
              <CurrencyInput
                label="Budget Goal"
                value={budgetGoal}
                onChange={(e) => {
                  setBudgetGoal(e.target.value);
                  if (errors.goal) {
                    setErrors({ ...errors, goal: undefined });
                  }
                }}
                placeholder="Enter budget amount"
                required
                error={errors.goal || null}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="w-full">
                <DateInput
                  name="start-date"
                  label="Start Date"
                  placeholder="Select start date"
                  value={startDate}
                  onChange={(date) => {
                    if (date) {
                      setStartDate(date);
                      if (errors.startDate || errors.endDate) {
                        setErrors({
                          ...errors,
                          startDate: undefined,
                          endDate: undefined,
                        });
                      }
                    }
                  }}
                  required
                  className="w-full"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div className="w-full">
                <DateInput
                  label="End Date"
                  name="end-date"
                  placeholder="Select end date"
                  value={endDate}
                  onChange={(date) => {
                    if (date) {
                      setEndDate(date);
                      if (errors.endDate) {
                        setErrors({ ...errors, endDate: undefined });
                      }
                    }
                  }}
                  required
                  className="w-full"
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
                )}
              </div>
            </div>

            <div className="w-full">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="recurring" className="ml-2 text-gray-900 ">
                  Recurring Budget
                </label>
              </div>
              {isRecurring && (
                <Select
                  options={recurrenceOptions}
                  selectedValue={budgetRecurrence}
                  onChange={(value: string) =>
                    setBudgetRecurrence(value as RecurrenceType)
                  }
                  bg="bg-white border border-gray-200"
                  name="Select recurrence"
                />
              )}
            </div>

            <div className="w-full">
              <SearchableSelect
                label="Policies"
                options={policyOptions}
                selectedValue={selectedPolicyIds[0] || ''}
                onChange={(value: string) => {
                  if (value) {
                    setSelectedPolicyIds([value]);
                    if (errors.policies) {
                      setErrors({ ...errors, policies: undefined });
                    }
                  }
                }}
                name="Select policy"
              />
              {errors.policies && (
                <p className="mt-1 text-sm text-red-500">{errors.policies}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-2 bg-white border-t border-gray-200 flex justify-end space-x-3">
          <Button
            height={true}
            text={createBudgetLoading ? 'Saving...' : 'Save'}
            type="button"
            className='!py-3 !px-6'
            onClick={handleSave}
            disabled={createBudgetLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateBudgetModal;
