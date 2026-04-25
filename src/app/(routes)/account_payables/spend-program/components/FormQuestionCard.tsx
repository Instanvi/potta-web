import React, { useState } from 'react';
import { DEPARTMENT_TYPE_SET } from './FormBuilder';
import {
  FiTrash2,
  FiCopy,
  FiArrowUp,
  FiArrowDown,
  FiChevronDown,
  FiChevronUp,
  FiType,
  FiUsers,
  FiCheckSquare,
  FiHash,
  FiCalendar,
  FiLink,
  FiMail,
  FiChevronRight,
  FiUpload,
  FiMapPin,
  FiPhone,
  FiFileText,
  FiHome,
  FiClipboard,
  FiFilePlus,
  FiPlus,
} from 'react-icons/fi';
import { IoLinkSharp } from 'react-icons/io5';
import { Switch } from '@potta/components/shadcn/switch';
import {
  Select as ShadcnSelect,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@potta/components/shadcn/select';
import { useRef } from 'react';
import Select from '@potta/components/select';
import { FormQuestion, QuestionType } from '../utils/types';
import { defaultQuestions } from '../utils/values';

const QUESTION_TYPE_OPTIONS: {
  value: QuestionType;
  label: string;
  icon: React.ReactNode;
  group?: string;
}[] = [
  { value: 'text', label: 'Text', icon: <FiType className="text-base" /> },
  {
    value: 'paragraph',
    label: 'Paragraph',
    icon: <FiFileText className="text-base" />,
  },
  {
    value: 'boolean',
    label: 'Boolean',
    icon: <FiCheckSquare className="text-base" />,
  },
  { value: 'number', label: 'Number', icon: <FiHash className="text-base" /> },
  { value: 'date', label: 'Date', icon: <FiCalendar className="text-base" /> },
  { value: 'link', label: 'Link', icon: <FiLink className="text-base" /> },
  { value: 'email', label: 'Email', icon: <FiMail className="text-base" /> },
  {
    value: 'single_select',
    label: 'Single Select',
    icon: <FiChevronRight className="text-base" />,
  },
  {
    value: 'multi_select',
    label: 'Multi Select',
    icon: <FiCheckSquare className="text-base" />,
  },
  {
    value: 'file_upload',
    label: 'File Upload',
    icon: <FiUpload className="text-base" />,
  },
  {
    value: 'address',
    label: 'Address',
    icon: <FiMapPin className="text-base" />,
  },
  {
    value: 'contact',
    label: 'Contact',
    icon: <FiPhone className="text-base" />,
  },
  // Department fields
  {
    value: 'billing_contact',
    label: 'Billing Contact',
    icon: <FiUsers className="text-base" />,
    group: 'Department',
  },
  {
    value: 'vendor',
    label: 'Vendor',
    icon: <FiUsers className="text-base" />,
    group: 'Department',
  },
  {
    value: 'billing_address',
    label: 'Billing Address',
    icon: <FiHome className="text-base" />,
    group: 'Department',
  },
  {
    value: 'net_payment_terms',
    label: 'Net Payment Terms',
    icon: <FiClipboard className="text-base" />,
    group: 'Department',
  },
  {
    value: 'vendor_address',
    label: 'Vendor Address',
    icon: <FiHome className="text-base" />,
    group: 'Department',
  },
  {
    value: 'vendor_contact',
    label: 'Vendor Contact',
    icon: <FiUsers className="text-base" />,
    group: 'Department',
  },
  {
    value: 'promise_date',
    label: 'Promise Date',
    icon: <FiCalendar className="text-base" />,
    group: 'Department',
  },
  {
    value: 'shipping_date',
    label: 'Shipping Date',
    icon: <FiCalendar className="text-base" />,
    group: 'Department',
  },
  {
    value: 'ship_to_address',
    label: 'Ship To Address',
    icon: <FiHome className="text-base" />,
    group: 'Department',
  },
  {
    value: 'memo',
    label: 'Memo',
    icon: <FiFileText className="text-base" />,
    group: 'Department',
  },
  {
    value: 'attachments',
    label: 'Attachments',
    icon: <FiFilePlus className="text-base" />,
    group: 'Department',
  },
];

const mockVendors = [
  { value: 'vendor1', label: 'Vendor 1' },
  { value: 'vendor2', label: 'Vendor 2' },
  { value: 'vendor3', label: 'Vendor 3' },
];

interface FormQuestionCardProps {
  question: FormQuestion;
  index: number;
  total: number;
  updateQuestion: (id: string, updates: Partial<FormQuestion>) => void;
  removeQuestion: (id: string) => void;
  duplicateQuestion: (id: string) => void;
  moveQuestion: (id: string, direction: 'up' | 'down') => void;
}

const FormQuestionCard: React.FC<FormQuestionCardProps> = ({
  question,
  index,
  total,
  updateQuestion,
  removeQuestion,
  duplicateQuestion,
  moveQuestion,
}) => {
  const [mappingOpen, setMappingOpen] = useState(false);
  const [newOption, setNewOption] = useState('');
  const optionInputRef = useRef<HTMLInputElement>(null);

  // Handle type change
  const handleTypeChange = (newType: QuestionType) => {
    updateQuestion(question.id, {
      ...(defaultQuestions[newType] as Partial<FormQuestion>),
      type: newType,
    });
  };

  // Option editor for select types
  const renderOptionsEditor = () => {
    if (question.type !== 'single_select' && question.type !== 'multi_select')
      return null;
    const options = question.options || [];
    return (
      <div className="mb-2">
        <div className="mb-1 text-xs font-medium text-gray-500">Options</div>
        <div className="flex flex-col gap-1">
          {options.length === 0 && (
            <div className="text-xs text-gray-400 italic">No options yet</div>
          )}
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2 group">
              <input
                className="border px-2 py-1 text-xs w-full focus:border-green-600 focus:outline-none"
                value={opt}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[i] = e.target.value;
                  updateQuestion(question.id, { options: newOptions });
                }}
                placeholder={`Option ${i + 1}`}
              />
              <button
                className="text-red-400 hover:text-red-600 text-xs px-1"
                onClick={() => {
                  const newOptions = options.filter((_, idx) => idx !== i);
                  updateQuestion(question.id, { options: newOptions });
                }}
                type="button"
                aria-label="Delete option"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
        <form
          className="flex items-center gap-2 mt-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newOption.trim()) return;
            const newOptions = [...options, newOption.trim()];
            updateQuestion(question.id, { options: newOptions });
            setNewOption('');
            optionInputRef.current?.focus();
          }}
        >
          <input
            ref={optionInputRef}
            className="border px-2 py-1 text-xs w-full focus:border-green-600 focus:outline-none"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            placeholder="Add option"
          />
          <button
            className="bg-green-600 hover:bg-green-700 text-white rounded px-2 py-1 text-xs"
            type="submit"
            aria-label="Add option"
          >
            <FiPlus />
          </button>
        </form>
      </div>
    );
  };

  const renderInputPreview = () => {
    switch (question.type) {
      case 'vendor':
        return (
          <Select
            options={mockVendors}
            selectedValue={question.options?.[0] || ''}
            onChange={(val) => updateQuestion(question.id, { options: [val] })}
            bg="bg-white"
            name="Vendor"
            SelectClass="rounded-none text-xs"
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Always ask top bar above card if department field */}
      <div className="border  bg-white shadow-sm relative">
        {DEPARTMENT_TYPE_SET.has(question.type) && (
          <div className="w-full p-4 border-b border-gray-200 text-xs font-medium text-gray-700">
            <div>Always ask this question</div>
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShadcnSelect
                value={question.type}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger className="min-w-[110px] w-auto h-8 border-gray-200 bg-gray-50 text-xs font-medium px-2 px-3 flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    {
                      QUESTION_TYPE_OPTIONS.find(
                        (opt) => opt.value === question.type
                      )?.icon
                    }
                    <span>
                      {
                        QUESTION_TYPE_OPTIONS.find(
                          (opt) => opt.value === question.type
                        )?.label
                      }
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPE_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="flex items-center gap-2"
                    >
                      <div className="flex items-center gap-2">
                        {opt.icon}
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </ShadcnSelect>
            </div>
            <div className="flex items-center gap-2">
              {/* No badge here */}
              <span className="text-xs text-gray-500 mr-2">Required</span>
              <Switch
                checked={!!question.required}
                onCheckedChange={(checked) =>
                  updateQuestion(question.id, { required: checked })
                }
                aria-label="Toggle required"
              />
              {/* Only show alwaysAsk toggle for non-department fields */}
              {DEPARTMENT_TYPE_SET.has(question.type) && (
                <>
                  <span className="text-xs text-gray-500 mr-2">Always ask</span>
                  <Switch
                    checked={!!question.alwaysAsk}
                    onCheckedChange={(checked) =>
                      updateQuestion(question.id, { alwaysAsk: checked })
                    }
                    aria-label="Toggle always ask"
                  />
                </>
              )}
              <button
                onClick={() => moveQuestion(question.id, 'up')}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                title="Move up"
              >
                <FiArrowUp />
              </button>
              <button
                onClick={() => moveQuestion(question.id, 'down')}
                disabled={index === total - 1}
                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                title="Move down"
              >
                <FiArrowDown />
              </button>
              <button
                onClick={() => duplicateQuestion(question.id)}
                className="p-1 text-gray-400 hover:text-gray-700"
                title="Duplicate"
              >
                <FiCopy />
              </button>
              <button
                onClick={() => removeQuestion(question.id)}
                className="p-1 text-red-500 hover:text-red-700"
                title="Delete"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
          <div className="mb-2">
            <input
              className="w-full text-base font-medium border-b border-gray-200 focus:border-green-600 outline-none py-1 mb-1"
              value={question.title}
              onChange={(e) =>
                updateQuestion(question.id, { title: e.target.value })
              }
              placeholder="Question title"
            />
            <input
              className="w-full text-xs border-b border-gray-100 focus:border-green-300 outline-none py-1 text-gray-600"
              value={question.description || ''}
              onChange={(e) =>
                updateQuestion(question.id, { description: e.target.value })
              }
              placeholder="Description (optional)"
            />
          </div>
          {/* Render type-specific input preview */}
          <div className="mb-2">{renderInputPreview()}</div>
          {renderOptionsEditor()}
          <div className="flex items-center gap-2 mt-2">
            <button
              className="flex items-end border p-2.5 broder-2 gap-1 text-xs text-gray-600 hover:text-green-700"
              onClick={() => setMappingOpen((v) => !v)}
              type="button"
            >
              <IoLinkSharp size={20} /> <span>Add mapping</span>
            </button>
            {/* Only show Plus badge if vendor and alwaysAsk is false */}
          </div>
          {mappingOpen && (
            <div className="mt-2">
              <input
                className="w-full border-b border-gray-200 focus:border-green-600 outline-none py-1 text-xs"
                value={question.mapping || ''}
                onChange={(e) =>
                  updateQuestion(question.id, { mapping: e.target.value })
                }
                placeholder="Mapping value"
              />
            </div>
          )}
          {/* {DEPARTMENT_TYPE_SET && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500">
                Always ask this question
              </span>
              <Switch
                checked={!!question.alwaysAsk}
                onCheckedChange={(checked) =>
                  updateQuestion(question.id, { alwaysAsk: checked })
                }
                aria-label="Toggle always ask"
              />
            </div>
          )} */}
        </div>
      </div>
    </>
  );
};

export default FormQuestionCard;
