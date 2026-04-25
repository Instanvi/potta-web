import React, { useState } from 'react';
import Slider from '@potta/components/slideover';
import FormBuilder from './FormBuilder';
import FormPreview from './FormPreview';
import Button from '@potta/components/button';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import RightSideModal from '../../re-imbursements/components/RightSideModal';
import Select from '@potta/components/select';
import PreSpendControlsForm from './PreSpendControlsForm';
import {
  createSpendProgram,
  convertFormQuestionsToBackend,
} from '../utils/api';
import {
  SpendProgramType,
  FormBuilderState,
  CreateSpendProgramDTO,
} from '../utils/types';
import toast from 'react-hot-toast';

interface NewSpendProgramSlideoverProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCreated?: () => void;
}

const programTypes = [
  {
    key: 'CARD',
    label: 'Card program',
    description: 'Issue cards for benefits, stipends, etc.',
    icon: (
      <svg
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-credit-card"
      >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    plus: false,
  },
  {
    key: 'PROCUREMENT',
    label: 'Procurement',
    description: 'Manage procurement requests for software, contractors, etc.',
    icon: (
      <svg
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-file-text"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
    plus: true,
  },
];

// Example form state structure
const initialFormState: FormBuilderState = {
  questions: [],
};

const NewSpendProgramSlideover: React.FC<NewSpendProgramSlideoverProps> = ({
  open,
  setOpen,
  onCreated,
}) => {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<SpendProgramType | ''>('');
  const [formState, setFormState] =
    useState<FormBuilderState>(initialFormState);
  const [showPreview, setShowPreview] = useState(false);
  const [programName, setProgramName] = useState('');
  const [description, setDescription] = useState('');
  const [showDescriptionError, setShowDescriptionError] = useState(false);
  const [showProgramNameError, setShowProgramNameError] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formRef = React.useRef<{ submit: () => void }>(null);

  // Step 0: Type selection
  // Step 1: Form builder + preview

  // In the final step, handle creation
  const handleCreate = async (preSpendControls: any) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload: CreateSpendProgramDTO = {
        type: selected as SpendProgramType,
        name: programName,
        description,
        status: 'active',
        unit: 'USD', // Default unit
        purchaseOrders: 0, // Default value
        form: convertFormQuestionsToBackend(formState.questions),
        preSpendControls,
      };

      await createSpendProgram(payload);
      toast.success('Spend program created successfully!');
      setIsSubmitting(false);
      setOpen(false);
      if (onCreated) onCreated();
    } catch (err: any) {
      setIsSubmitting(false);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create spend program';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCreateClick = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  return (
    <Slider
      edit={false}
      title="New Spend Program"
      buttonText="spend-program"
      open={open}
      setOpen={setOpen}
      noPanelScroll
      sliderClass="!py-0 "
      sliderContentClass="!mt-1 !mb-20"
    >
      {step === 0 && (
        <div className="w-full max-w-xl mx-auto py-8 px-2">
          <div className="mb-4">
            <div className="text-lg font-medium mb-4">
              What type do you need?
            </div>
            <div className="flex flex-col gap-4">
              {programTypes.map((type) => (
                <label
                  key={type.key}
                  className={`flex items-center border px-4 py-3 cursor-pointer transition-all ${
                    selected === type.key
                      ? 'border-green-700 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="mr-4">{type.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-base flex items-center gap-2">
                      {type.label}
                      {/* {type.plus && (
                        <span className="bg-yellow-300 text-xs text-gray-900 font-medium px-2 py-0.5 rounded ml-1">
                          Plus
                        </span>
                      )} */}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {type.description}
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="programType"
                    checked={selected === type.key}
                    onChange={() => setSelected(type.key as SpendProgramType)}
                    className="ml-4 h-5 w-5 accent-green-700"
                  />
                </label>
              ))}
            </div>
          </div>
          {/* Show procurement-specific form if procurement is selected */}
          {selected === 'PROCUREMENT' && (
            <div className="">
              <div className="">
                <div className="text-2xl font-medium mb-4">
                  What's this program for?
                </div>
                <input
                  type="text"
                  className={`w-full border border-gray-300  px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:italic placeholder-gray-400${
                    showProgramNameError
                      ? ' border-red-500 focus:ring-red-500'
                      : ''
                  }`}
                  placeholder="Name the program"
                  value={programName}
                  onChange={(e) => {
                    setProgramName(e.target.value);
                    setShowProgramNameError(false);
                  }}
                />
                {showProgramNameError && (
                  <span className="text-xs text-red-500">
                    Program name is required
                  </span>
                )}
                {/* Suggestions row */}
                <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  Suggestions:
                  <a
                    href="#"
                    className="text-xs text-gray-600 hover:text-green-700 underline cursor-pointer"
                  >
                    Software
                  </a>
                  ,
                  <a
                    href="#"
                    className="text-xs text-gray-600 hover:text-green-700 underline cursor-pointer"
                  >
                    Contractors
                  </a>
                  ,
                  <a
                    href="#"
                    className="text-xs text-gray-600 hover:text-green-700 underline cursor-pointer"
                  >
                    Office supplies
                  </a>
                </div>
              </div>
              {/* Description field */}
              <div className="mb-10 mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description{' '}
                  <span className="text-gray-400 font-normal">(required)</span>
                </label>
                <div className="relative">
                  {/* Optional icon for context */}
                  {/* <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-lg" /> */}
                  <input
                    type="text"
                    className={`w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 transition${
                      showDescriptionError
                        ? ' border-red-500 focus:ring-red-500'
                        : ''
                    }`}
                    placeholder="Describe this program for your employees to see"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setShowDescriptionError(false);
                    }}
                  />
                  {showDescriptionError && (
                    <span className="absolute left-0 -bottom-5 text-xs text-red-500">
                      Description is required
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        
        </div>
      )}
      {step === 1 && (
        <div className="w-full max-w-[1200px] mx-auto">
          {/* Remove the old navigation section from step 1 */}
          <div className=" px-2 h-full w-full flex justify-center transition-all duration-300 ease-in-out">
            <FormBuilder formState={formState} setFormState={setFormState} />
          </div>
          <RightSideModal
            open={showPreviewModal}
            setOpen={setShowPreviewModal}
            title="Form Preview"
            width="max-w-3xl"
          >
            <FormPreview formState={formState} programName={programName} />
          </RightSideModal>
        </div>
      )}
      {step === 2 && (
        <>
          <PreSpendControlsForm
            programName={programName}
            onCreate={handleCreate}
            isSubmitting={isSubmitting}
            formRef={formRef}
          />

          <RightSideModal
            open={showPreviewModal}
            setOpen={setShowPreviewModal}
            title="Form Preview"
            width="max-w-3xl"
          >
            <FormPreview formState={formState} programName={programName} />
          </RightSideModal>
        </>
      )}

      {/* Fixed bottom navigation for all steps */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-between items-center">
        <div>
          {step > 0 && (
            <button
              className="text-sm text-gray-500 hover:underline flex items-center gap-1"
              onClick={() => setStep(step - 1)}
            >
              &larr; Previous
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {step === 0 && (
            <Button
              type="submit"
              text="Next"
              className="!py-3 !px-6"
              onClick={() => {
                if (!selected) return;
                if (selected === 'PROCUREMENT') {
                  let hasError = false;
                  if (!programName.trim()) {
                    setShowProgramNameError(true);
                    hasError = true;
                  }
                  if (!description.trim()) {
                    setShowDescriptionError(true);
                    hasError = true;
                  }
                  if (hasError) return;
                }
                setStep(1);
              }}
              disabled={
                !selected ||
                (selected === 'PROCUREMENT' &&
                  (!programName.trim() || !description.trim()))
              }
            />
          )}

          {step === 1 && (
            <>
              <Button
                text={showPreviewModal ? 'Hide preview' : 'View preview'}
                type="button"
                className="text-sm"
                onClick={() => setShowPreviewModal(true)}
                icon={showPreviewModal ? <FiEyeOff /> : <FiEye />}
              />
              <Button
                text="Next"
                type="button"
                className="text-sm"
                onClick={() => setStep(2)}
                icon={<i className="ri-arrow-right-line"></i>}
              />
            </>
          )}

          {step === 2 && (
            <>
              <Button
                text={showPreviewModal ? 'Hide preview' : 'View preview'}
                type="button"
                className="text-sm"
                onClick={() => setShowPreviewModal(true)}
                icon={showPreviewModal ? <FiEyeOff /> : <FiEye />}
              />
              <Button
                text={isSubmitting ? 'Creating...' : `Create "${programName}"`}
                type="button"
                className="text-sm"
                onClick={() => formRef.current?.submit()}
                icon={
                  isSubmitting ? (
                    <i className="ri-loader-4-line animate-spin"></i>
                  ) : (
                    <i className="ri-file-add-line"></i>
                  )
                }
                disabled={isSubmitting}
                isLoading={isSubmitting}
              />
            </>
          )}
        </div>
      </div>
    </Slider>
  );
};

export default NewSpendProgramSlideover;
