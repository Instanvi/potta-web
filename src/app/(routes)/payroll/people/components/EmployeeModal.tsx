import React, { useState } from 'react';
import Button from '@potta/components/button';
import PottaLoader from '@potta/components/pottaloader';
import BaseInfo from './baseInfo';
import Address from './address';
import BankAccount from './bankAccount';
import Compensation from './compensation';
import Schedule from './schedule';
import Benefit from './benefit/page';
import EmployeeFormSteps from './EmployeeFormSteps';
import { FORM_STEPS, STEPS_WITHOUT_BUTTONS } from '../constants';
import { useEmployeeForm } from '../hooks/useEmployeeForm';
import { toast } from 'react-hot-toast'; // Fixed import

interface EmployeeModalProps {
  showModal: boolean;
  modalAnimation: string;
  onClose: () => void;
  onComplete: () => void;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({
  showModal,
  modalAnimation,
  onClose,
  onComplete,
}) => {
  const {
    active,
    isLoading,
    isFetching,
    personId,
    formKey,
    baseInfo,
    address,
    bankAccount,
    compensation,
    schedule,
    handleBaseInfoChange,
    handleAddressChange,
    handleBankAccountChange,
    handleCompensationChange,
    handleScheduleChange,
    handleProceed,
    handleTabClick,
    clearSavedData,
    setActive,
    showValidationErrors,
    validateBaseInfoData,
    validateAddressData,
    validateBankAccountData,
    triggerValidationForCurrentStep,
  } = useEmployeeForm();

  // Remove local state as we're using the unified validation system from the hook
  // const [showValidationErrors, setShowValidationErrors] = useState(false);

  const shouldShowButtons = () => {
    return !STEPS_WITHOUT_BUTTONS.includes(active as any);
  };

  const handleFormProceed = async () => {
    console.log(
      '🔥 UNIFIED VALIDATION - Starting validation for step:',
      active
    );

    // Trigger validation display for current step
    triggerValidationForCurrentStep();

    // Validate based on current step
    let isValid = false;

    switch (active) {
      case FORM_STEPS.EMPLOYEE_BASE_INFO:
        isValid = await validateBaseInfoData();
        break;
      case FORM_STEPS.EMPLOYEE_LOCATION:
        isValid = await validateAddressData();
        break;
      case FORM_STEPS.BANK_ACCOUNT:
        isValid = await validateBankAccountData();
        break;
      default:
        // For other steps, assume valid for now
        isValid = true;
        break;
    }

    if (!isValid) {
      // DON'T show toast - let user see the field errors instead
      console.log('❌ Validation failed - errors should be visible on inputs');
      return;
    }

    // If validation passes, proceed normally
    const result = await handleProceed();
    if (result.completed) {
      onComplete();
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Processing...';
    if (active === FORM_STEPS.BANK_ACCOUNT && !personId)
      return 'Create Employee';
    if (active === FORM_STEPS.EMPLOYEE_TAX_INFO) return 'Complete Setup';
    return 'Proceed';
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[999] flex flex-col items-center">
      <div
        className={`bg-white w-full relative h-screen overflow-none ${modalAnimation}`}
        style={{ transform: 'translate3d(0, 0, 0)' }}
      >
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <h2 className="text-xl font-medium">
            {personId ? 'Edit Employee' : 'New Employee'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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

        <div className="w-full flex px-4">
          <EmployeeFormSteps
            active={active}
            personId={personId}
            onTabClick={handleTabClick}
          />

          <div className="w-full overflow-y-auto h-[calc(100vh-68px)] pt-0 relative">
            {isFetching && (
              <div className="fixed z-[9999] backdrop-blur-sm top-0 left-0 h-screen w-screen grid place-content-center">
                <PottaLoader />
              </div>
            )}

            <div className="w-full h-full overflow-auto pb-20">
              {active === FORM_STEPS.EMPLOYEE_BASE_INFO && (
                <BaseInfo
                  key={`baseInfo-${formKey}`}
                  onChange={handleBaseInfoChange}
                  initialData={baseInfo}
                  showValidationErrors={showValidationErrors.baseInfo}
                />
              )}

              {active === FORM_STEPS.EMPLOYEE_LOCATION && (
                <Address
                  key={`address-${formKey}`}
                  onChange={handleAddressChange}
                  initialData={address}
                  showValidationErrors={showValidationErrors.address}
                />
              )}

              {active === FORM_STEPS.BANK_ACCOUNT && (
                <BankAccount
                  key={`bankAccount-${formKey}`}
                  personId={personId || ''}
                  onChange={handleBankAccountChange}
                  initialData={bankAccount}
                  showValidationErrors={showValidationErrors.bankAccount}
                />
              )}

              {active === FORM_STEPS.COMPENSATION && (
                <Compensation
                  key={`compensation-${formKey}`}
                  personId={personId || ''}
                  onChange={handleCompensationChange}
                  initialData={compensation}
                  onComplete={() => setActive(FORM_STEPS.PAY_SCHEDULE)}
                />
              )}

              {active === FORM_STEPS.PAY_SCHEDULE && (
                <Schedule
                  key={`schedule-${formKey}`}
                  onChange={handleScheduleChange}
                  initialData={schedule}
                  personId={personId || ''}
                  onComplete={() => setActive(FORM_STEPS.BENEFITS)}
                />
              )}

              {active === FORM_STEPS.BENEFITS && (
                <Benefit
                  key={`benefit-${formKey}`}
                  personId={personId || ''}
                  onComplete={() => {
                    clearSavedData();
                    onComplete();
                  }}
                />
              )}
            </div>

            {/* Fixed button at bottom right */}
            {shouldShowButtons() && (
              <div className="fixed bottom-0 left-0 right-0 p-2 bg-white border-t border-gray-200 flex justify-end space-x-3">
                <Button
                  text={getButtonText()}
                  type="submit"
                  onClick={handleFormProceed}
                  disabled={isLoading}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;
