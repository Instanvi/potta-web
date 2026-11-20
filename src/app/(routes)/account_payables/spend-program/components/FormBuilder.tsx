import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import FormQuestionCard from './FormQuestionCard';
import {
  FiType,
  FiFileText,
  FiCheckSquare,
  FiHash,
  FiCalendar,
  FiLink,
  FiMail,
  FiChevronRight,
  FiUpload,
  FiMapPin,
  FiPhone,
  FiUsers,
  FiHome,
  FiClipboard,
  FiFilePlus,
  FiPlus,
  FiX,
  FiChevronDown,
} from 'react-icons/fi';
import Select from '@potta/components/select';
import { defaultQuestions } from '../utils/values';
import { FormQuestion, QuestionType } from '../utils/types';
import { DivideCircle } from 'lucide-react';

interface FormBuilderProps {
  formState: { questions: FormQuestion[] };
  setFormState: (state: { questions: FormQuestion[] }) => void;
}

const BASIC_TYPES = [
  { type: 'text', label: 'Text', icon: <FiType /> },
  { type: 'paragraph', label: 'Paragraph', icon: <FiFileText /> },
  { type: 'boolean', label: 'Boolean', icon: <FiCheckSquare /> },
  { type: 'number', label: 'Number', icon: <FiHash /> },
  { type: 'date', label: 'Date', icon: <FiCalendar /> },
  { type: 'link', label: 'Link', icon: <FiLink /> },
  { type: 'email', label: 'Email', icon: <FiMail /> },
  { type: 'single_select', label: 'Single Select', icon: <FiChevronRight /> },
  { type: 'multi_select', label: 'Multi Select', icon: <FiCheckSquare /> },
  { type: 'file_upload', label: 'File Upload', icon: <FiUpload /> },
  { type: 'address', label: 'Address', icon: <FiMapPin /> },
  { type: 'contact', label: 'Contact', icon: <FiPhone /> },
];
const DEPARTMENT_TYPES = [
  { type: 'billing_contact', label: 'Billing Contact', icon: <FiUsers /> },
  { type: 'billing_address', label: 'Billing Address', icon: <FiHome /> },
  {
    type: 'net_payment_terms',
    label: 'Net Payment Terms',
    icon: <FiClipboard />,
  },
  { type: 'vendor_address', label: 'Vendor Address', icon: <FiHome /> },
  { type: 'vendor_contact', label: 'Vendor Contact', icon: <FiUsers /> },
  { type: 'promise_date', label: 'Promise Date', icon: <FiCalendar /> },
  { type: 'shipping_date', label: 'Shipping Date', icon: <FiCalendar /> },
  { type: 'ship_to_address', label: 'Ship To Address', icon: <FiHome /> },
  { type: 'memo', label: 'Memo', icon: <FiFileText /> },
  { type: 'attachments', label: 'Attachments', icon: <FiFilePlus /> },
  { type: 'vendor', label: 'Vendor', icon: <FiChevronDown /> }, // new vendor field
];

export const DEPARTMENT_TYPE_SET = new Set(
  DEPARTMENT_TYPES.map((item) => item.type)
);

const FormBuilder: React.FC<FormBuilderProps> = ({
  formState,
  setFormState,
}) => {
  const { questions } = formState;
  const [showTypeModal, setShowTypeModal] = useState(false);

  // Add two default cards: text and vendor
  useEffect(() => {
    if (questions.length === 0) {
      const newText: FormQuestion = {
        id: uuidv4(),
        ...(defaultQuestions['text'] as FormQuestion),
      };
      const newVendor: FormQuestion = {
        id: uuidv4(),
        type: 'vendor',
        title: 'Vendor',
        required: true,
      };
      setFormState({ questions: [newText, newVendor] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add new question
  const addQuestion = (type: QuestionType) => {
    const base = { ...defaultQuestions[type] };
    delete base.id; // Ensure no duplicate id
    const isDepartment = DEPARTMENT_TYPE_SET.has(type);
    const { id: _removed, ...baseWithoutId } = base;
    const newQuestion: FormQuestion = {
      id: uuidv4(),
      ...baseWithoutId,
      type,
      title: base.title || '',
      required: base.required ?? false,
      alwaysAsk: isDepartment ? true : base.alwaysAsk ?? false,
      description: '',
      mapping: '',
    };
    setFormState({ questions: [...questions, newQuestion] });
  };

  // Update a question
  const updateQuestion = (id: string, updates: Partial<FormQuestion>) => {
    setFormState({
      questions: questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    });
  };

  // Remove a question
  const removeQuestion = (id: string) => {
    setFormState({ questions: questions.filter((q) => q.id !== id) });
  };

  // Duplicate a question
  const duplicateQuestion = (id: string) => {
    const q = questions.find((q) => q.id === id);
    if (q) {
      const copy = { ...q, id: uuidv4() };
      setFormState({ questions: [...questions, copy] });
    }
  };

  // Move question up/down
  const moveQuestion = (id: string, direction: 'up' | 'down') => {
    const idx = questions.findIndex((q) => q.id === id);
    if (idx < 0) return;
    const newQuestions = [...questions];
    if (direction === 'up' && idx > 0) {
      [newQuestions[idx - 1], newQuestions[idx]] = [
        newQuestions[idx],
        newQuestions[idx - 1],
      ];
    } else if (direction === 'down' && idx < newQuestions.length - 1) {
      [newQuestions[idx + 1], newQuestions[idx]] = [
        newQuestions[idx],
        newQuestions[idx + 1],
      ];
    }
    setFormState({ questions: newQuestions });
  };

  return (
    <div className="bg-white border border-gray-200 p-6 min-h-[400px] w-full pb-0">
      <div className="flex items-center mb-4 justify-between">
        <div className="">
          <h3 className="text-xl font-medium mb-2">Request form</h3>
          <div className="text-gray-600">Add questions</div>
        </div>
        <div className='flex items-center gap-2'>
          {' '}
          <button
            className="flex items-center justify-center w-10 h-10 rounded-full bg-green-700 hover:bg-green-800 text-white text-2xl shadow transition-all focus:outline-none focus:ring-2 focus:ring-green-400"
            onClick={() => setShowTypeModal(true)}
            aria-label="Add question"
            type="button"
          >
            <FiPlus />
          </button>
          <label className="block text-sm font-medium">Add question</label>
        </div>
      </div>
      {/* Make the question cards scrollable */}
      <div className="flex flex-col gap-6 overflow-y-auto max-h-[65vh] custom-scrollbar">
        {questions.map((q, idx) => (
          <FormQuestionCard
            key={q.id}
            question={q}
            index={idx}
            total={questions.length}
            updateQuestion={updateQuestion}
            removeQuestion={removeQuestion}
            duplicateQuestion={duplicateQuestion}
            moveQuestion={moveQuestion}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        {/* Popover/modal for type selection */}
        {showTypeModal && (
          <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20 transition-opacity duration-300 animate-fade-in">
              <div
                className="bg-white  shadow-2xl p-6 min-w-[340px] w-full max-w-lg relative transition-all duration-300 transform scale-95 opacity-0 animate-modal-in"
                style={{ animation: 'modal-in 0.3s forwards' }}
              >
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
                  onClick={() => setShowTypeModal(false)}
                  aria-label="Close"
                  type="button"
                >
                  <FiX />
                </button>
                <h4 className="text-lg font-medium mb-4">
                  Select question type
                </h4>
                <div className="mb-2 text-xs font-medium text-gray-500">
                  Basic fields
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {BASIC_TYPES.map((item) => (
                    <button
                      key={item.type}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-100 hover:bg-gray-100 text-sm w-full transition"
                      onClick={() => {
                        addQuestion(item.type as QuestionType);
                        setShowTypeModal(false);
                      }}
                      type="button"
                    >
                      <span className="text-lg">{item.icon}</span> {item.label}
                    </button>
                  ))}
                </div>
                <div className="mb-2 text-xs font-medium text-gray-500">
                  Department fields
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {DEPARTMENT_TYPES.map((item) => (
                    <button
                      key={item.type}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-100 hover:bg-gray-100 text-sm w-full transition"
                      onClick={() => {
                        addQuestion(item.type as QuestionType);
                        setShowTypeModal(false);
                      }}
                      type="button"
                    >
                      <span className="text-lg">{item.icon}</span> {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <style jsx global>{`
              @keyframes modal-in {
                from {
                  opacity: 0;
                  transform: scale(0.95);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }
            `}</style>
          </>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;
