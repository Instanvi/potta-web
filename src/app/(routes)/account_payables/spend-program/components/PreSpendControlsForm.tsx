import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Button from '@potta/components/button';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FaEdit } from 'react-icons/fa';
import AccordionSelectField from '@potta/components/AccordionSelectField';
import { LuUserRoundCheck } from 'react-icons/lu';
import { RxCursorArrow } from 'react-icons/rx';
import {
  FaUsers,
  FaUserCheck,
  FaUser,
  FaDollarSign,
  FaExchangeAlt,
} from 'react-icons/fa';
import SearchableSelect from '@potta/components/searchableSelect';
import { useEmployees } from '../hooks/useEmployees';
import { useOrgRoles } from '../hooks/useOrgRoles';
import {
  preSpendControlsValidationSchema,
  PreSpendControlsFormData,
} from '../validations/preSpendControlsValidation';

interface PreSpendControlsFormProps {
  programName: string;
  onCreate: (preSpendControls: any) => void;
  isSubmitting?: boolean;
  formRef?: React.RefObject<{ submit: () => void }>;
}

const PreSpendControlsForm: React.FC<PreSpendControlsFormProps> = ({
  programName,
  onCreate,
  isSubmitting,
  formRef,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<PreSpendControlsFormData>({
    resolver: yupResolver(preSpendControlsValidationSchema),
    mode: 'onChange',
    defaultValues: {
      allowEmployees: 'all',
      selectedEmployees: [],
      approver: 'manager',
      selectedApprovers: [],
      paymentMethod: 'purchase_order',
      canChangePayment: 'yes',
      approvalPolicy: 'spend_requests',
    },
  });

  const watchedAllowEmployees = watch('allowEmployees');
  const watchedApprover = watch('approver');

  // Fetch employees and org roles
  const { data: employees = [], isLoading: isLoadingEmployees } =
    useEmployees();
  const { data: orgRoles = [], isLoading: isLoadingRoles } = useOrgRoles();

  // Convert employees to options for SearchableSelect
  const employeeOptions = React.useMemo(() => {
    return employees.map((employee) => ({
      label: `${employee.firstName} ${employee.lastName}`,
      value: employee.uuid,
    }));
  }, [employees]);

  // Convert org roles to options for SearchableSelect
  const roleOptions = React.useMemo(() => {
    return orgRoles.map((role) => ({
      label: role.name,
      value: role.name,
    }));
  }, [orgRoles]);

  // Create approver options from org roles
  const approverOptions = React.useMemo(() => {
    const baseOptions = [
      { value: 'manager', label: 'Manager for the employee' },
      { value: 'custom', label: 'Custom approvers' },
    ];

    // Add org roles as individual options
    const roleOptions = orgRoles.map((role) => ({
      value: role.name,
      label: role.name,
    }));

    return [...baseOptions, ...roleOptions];
  }, [orgRoles]);

  const onSubmit = (data: PreSpendControlsFormData) => {
    const preSpendControls = {
      allowEmployees: data.allowEmployees,
      selectedEmployees:
        data.allowEmployees === 'specific' ? data.selectedEmployees : [],
      approver: data.approver,
      selectedApprovers:
        data.approver === 'custom' ? data.selectedApprovers : [],
      paymentMethod: data.paymentMethod,
      canChangePayment: data.canChangePayment,
      approvalPolicy: data.approvalPolicy,
    };
    onCreate(preSpendControls);
  };

  // Expose submit method to parent component
  React.useImperativeHandle(formRef, () => ({
    submit: () => handleSubmit(onSubmit)(),
  }));

  return (
    <div className="w-full max-w-[1000px] mx-auto p-8 ">
      <h1 className="text-3xl font-medium mb-6">
        Create "{programName || 'Procurement - Contractors'}"
      </h1>
      <div className="mb-6 border border-gray-200">
        <div className="flex justify-between p-4 items-center">
          <div className="">
            <div className=" text-lg font-medium">
              {programName || 'Procurement - Contractors'}
            </div>
            <div className="text-gray-500 text-sm">All customer requests.</div>
          </div>
          {/* <FaEdit className="text-gray-700" /> */}
        </div>
        <hr />
        <div className="flex items-center p-4 justify-between">
          <div className="flex flex-col">
            <div className="text-sm font-medium">Spend program type</div>
            <div className="text-gray-700">Procurement</div>
          </div>
          {/* <FaEdit className="text-gray-700" /> */}
        </div>
      </div>
      <div className="mb-8 pb-8">
        <div className="text-xl font-medium mb-4">Pre-spend controls</div>

        {/* Allow employees to request from this program */}
        <div className="mb-6">
          <Controller
            name="allowEmployees"
            control={control}
            render={({ field }) => (
              <div>
                <AccordionSelectField
                  label="Allow employees to request from this program"
                  icon={<RxCursorArrow />}
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: 'all', label: 'All employees' },
                    { value: 'specific', label: 'Specific employees' },
                  ]}
                  placeholder="Select employees"
                />
                {errors.allowEmployees && (
                  <p className="text-red-500 text-sm mt-1 ml-8">
                    {errors.allowEmployees.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Show employee selection when "Specific employees" is selected */}
          {watchedAllowEmployees === 'specific' && (
            <div className="mt-4 ml-8">
              <Controller
                name="selectedEmployees"
                control={control}
                render={({ field }) => (
                  <div>
                    <SearchableSelect
                      label="Select specific employees"
                      options={employeeOptions}
                      selectedValue={field.value}
                      onChange={field.onChange}
                      multiple={true}
                      placeholder="Search and select employees"
                      isLoading={isLoadingEmployees}
                    />
                    {errors.selectedEmployees && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.selectedEmployees.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          )}
        </div>

        {/* Who needs to approve procurement requests */}
        <div className="mb-6">
          <Controller
            name="approver"
            control={control}
            render={({ field }) => (
              <div>
                <AccordionSelectField
                  label="Who needs to approve procurement requests?"
                  icon={<LuUserRoundCheck />}
                  value={field.value}
                  onChange={field.onChange}
                  options={approverOptions}
                  placeholder="Select approver(s)"
                />
                {errors.approver && (
                  <p className="text-red-500 text-sm mt-1 ml-8">
                    {errors.approver.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Show role selection when "Custom approvers" is selected */}
          {watchedApprover === 'custom' && (
            <div className="mt-4 ml-8">
              <Controller
                name="selectedApprovers"
                control={control}
                render={({ field }) => (
                  <div>
                    <SearchableSelect
                      label="Select approver roles"
                      options={roleOptions}
                      selectedValue={field.value}
                      onChange={field.onChange}
                      multiple={true}
                      placeholder="Search and select roles"
                      isLoading={isLoadingRoles}
                    />
                    {errors.selectedApprovers && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.selectedApprovers.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          )}
        </div>

        <Controller
          name="paymentMethod"
          control={control}
          render={({ field }) => (
            <div className="mb-6">
              <AccordionSelectField
                label="What's the default payment method for procurement requests?"
                icon={<FaDollarSign />}
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: 'purchase_order', label: 'Purchase order' },
                  { value: 'credit_card', label: 'Credit card' },
                  { value: 'bank_transfer', label: 'Bank transfer' },
                ]}
                placeholder="Select payment method"
              />
              {errors.paymentMethod && (
                <p className="text-red-500 text-sm mt-1 ml-8">
                  {errors.paymentMethod.message}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          name="canChangePayment"
          control={control}
          render={({ field }) => (
            <div className="mb-6">
              <AccordionSelectField
                label="Can the payment method be changed by approvers and admins?"
                icon={<FaExchangeAlt />}
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                ]}
                placeholder="Select option"
              />
              {errors.canChangePayment && (
                <p className="text-red-500 text-sm mt-1 ml-8">
                  {errors.canChangePayment.message}
                </p>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default PreSpendControlsForm;
