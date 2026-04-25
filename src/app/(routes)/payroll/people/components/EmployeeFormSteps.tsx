import React from 'react';
import { FORM_STEPS, FORM_STEP_LABELS } from '../constants';

interface EmployeeFormStepsProps {
  active: string;
  personId: string | null;
  onTabClick: (tab: string) => void;
}

const EmployeeFormSteps: React.FC<EmployeeFormStepsProps> = ({
  active,
  personId,
  onTabClick,
}) => {
  const renderStepItem = (stepKey: string, label: string) => {
    const isActive = active === stepKey;
    const isDisabled =
      !personId &&
      stepKey !== FORM_STEPS.EMPLOYEE_BASE_INFO &&
      stepKey !== FORM_STEPS.EMPLOYEE_LOCATION && stepKey !== FORM_STEPS.BANK_ACCOUNT;

    return (
      <div
        key={stepKey}
        className={`cursor-pointer ${isDisabled ? 'opacity-50' : ''}`}
        onClick={() => onTabClick(stepKey)}
      >
        <p
          className={`whitespace-nowrap text-left ${
            isActive ? 'text-green-700 font-medium' : ''
          }`}
        >
          {label}
        </p>
      </div>
    );
  };

  return (
    <div className="w-[16%] pt-10 item-left space-y-7 border-r">
      {renderStepItem(
        FORM_STEPS.EMPLOYEE_BASE_INFO,
        FORM_STEP_LABELS[FORM_STEPS.EMPLOYEE_BASE_INFO]
      )}
      {renderStepItem(
        FORM_STEPS.EMPLOYEE_LOCATION,
        FORM_STEP_LABELS[FORM_STEPS.EMPLOYEE_LOCATION]
      )}
      {renderStepItem(
        FORM_STEPS.BANK_ACCOUNT,
        FORM_STEP_LABELS[FORM_STEPS.BANK_ACCOUNT]
      )}
      {renderStepItem(
        FORM_STEPS.COMPENSATION,
        FORM_STEP_LABELS[FORM_STEPS.COMPENSATION]
      )}
      {renderStepItem(
        FORM_STEPS.PAY_SCHEDULE,
        FORM_STEP_LABELS[FORM_STEPS.PAY_SCHEDULE]
      )}
      {renderStepItem(
        FORM_STEPS.BENEFITS,
        FORM_STEP_LABELS[FORM_STEPS.BENEFITS]
      )}
    </div>
  );
};

export default EmployeeFormSteps;
