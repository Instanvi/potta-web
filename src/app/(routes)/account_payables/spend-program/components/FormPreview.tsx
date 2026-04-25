import React, { useState } from 'react';
import {
  Select as ShadcnSelect,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@potta/components/shadcn/select';
import { Checkbox } from '@potta/components/shadcn/checkbox';
import { Switch } from '@potta/components/shadcn/switch';
import {
  RadioGroup,
  RadioGroupItem,
} from '@potta/components/shadcn/radio-group';
import { DEPARTMENT_TYPE_SET } from './FormBuilder';
import CustomDatePicker, {
  DateInput,
} from '@potta/components/customDatePicker';
import FileUpload from '@potta/components/fileUpload';
import Select from '@potta/components/select';
import Input from '@potta/components/input';
import SearchableSelect from '@potta/components/searchableSelect';

interface FormPreviewProps {
  formState: any;
  programName?: string;
}

const FormPreview: React.FC<FormPreviewProps> = ({
  formState,
  programName,
}) => {
  const questions = formState?.questions || [];

  // Local state for always-present fields
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expenseType, setExpenseType] = useState('expense');
  const [lineItems, setLineItems] = useState([
    { amount: '', description: '', quantity: '', tax: '' },
  ]);

  // Update lineItems structure when expenseType changes
  React.useEffect(() => {
    if (expenseType === 'expense') {
      setLineItems([{ amount: '', description: '' }]);
    } else {
      setLineItems([{ quantity: '', amount: '', description: '', tax: '' }]);
    }
  }, [expenseType]);

  // Calculate total
  const total =
    expenseType === 'item'
      ? lineItems.reduce((sum, item) => {
          const qty = parseFloat(item.quantity) || 0;
          const amt = parseFloat(item.amount) || 0;
          const tax = parseFloat(item.tax) || 0;
          return sum + qty * amt * (1 + tax / 100);
        }, 0)
      : lineItems.reduce(
          (sum, item) => sum + (parseFloat(item.amount) || 0),
          0
        );

  const handleLineItemChange = (idx: number, field: string, value: string) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };
  const addLineItem = () =>
    setLineItems([
      ...lineItems,
      { amount: '', description: '', quantity: '', tax: '' },
    ]);

  const frequencyOptions = [
    { value: '', label: 'Frequency (required)' },
    { value: 'one-time', label: 'One-time' },
    { value: 'recurring', label: 'Recurring' },
  ];

  const mockVendors = [
    { value: 'vendor1', label: 'Vendor 1' },
    { value: 'vendor2', label: 'Vendor 2' },
    { value: 'vendor3', label: 'Vendor 3' },
  ];

  return (
    <div className="bg-white  whitespace-nowrap border-gray-200  p-2 min-h-[400px] w-full">
      <h2 className="text-2xl font-medium mb-6">
        {programName
          ? `Request “${programName}”`
          : 'Request “Procurement - Contractors”'}
      </h2>
      {/* Always-present editable fields */}
      <div className="mb-8">
        <div className="mb-6">
          <div className="text-lg font-medium mb-2">
            Is it one-time or recurring?*
          </div>
          <div className="flex gap-3 mb-2">
            <div className="w-64">
              <Select
                options={frequencyOptions}
                selectedValue={frequency}
                onChange={setFrequency}
                bg="bg-white"
                name="Frequency"
                SelectClass="rounded-none"
              />
            </div>
            <div className="w-48">
              <DateInput
                name="startDate"
                placeholder="Start date"
                value={startDate ? new Date(startDate) : undefined}
                onChange={(date) =>
                  setStartDate(date ? date.toISOString().slice(0, 10) : '')
                }
                className="rounded-none"
              />
            </div>
            <div className="w-48">
              <DateInput
                name="endDate"
                placeholder="End date"
                value={endDate ? new Date(endDate) : undefined}
                onChange={(date) =>
                  setEndDate(date ? date.toISOString().slice(0, 10) : '')
                }
                className="rounded-none"
              />
            </div>
          </div>
        </div>
        <div className="mb-6">
          <div className="text-lg font-medium mb-2">How much?</div>
          <div className="border rounded-none p-4 mb-2">
            <RadioGroup
              className="flex gap-6 mb-4 rounded-none"
              value={expenseType}
              onValueChange={setExpenseType}
              orientation="horizontal"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="expense" />
                Expense
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="item" />
                Item
              </label>
            </RadioGroup>
            {lineItems.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                {expenseType === 'item' && (
                  <div className="w-24">
                    <Input
                      type="number"
                      name={`quantity-${idx}`}
                      inputClass="rounded-none"
                      placeholder="Qty"
                      value={item.quantity}
                      onchange={(e) =>
                        handleLineItemChange(idx, 'quantity', e.target.value)
                      }
                    />
                  </div>
                )}
                <div className="w-32">
                  <Input
                    type="number"
                    name={`amount-${idx}`}
                    inputClass="rounded-none"
                    placeholder="Amount"
                    value={item.amount}
                    onchange={(e) =>
                      handleLineItemChange(idx, 'amount', e.target.value)
                    }
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="text"
                    name={`description-${idx}`}
                    inputClass="rounded-none"
                    placeholder="Description"
                    value={item.description}
                    onchange={(e) =>
                      handleLineItemChange(idx, 'description', e.target.value)
                    }
                  />
                </div>
                {expenseType === 'item' && (
                  <div className="w-24">
                    <Input
                      type="number"
                      name={`tax-${idx}`}
                      inputClass="rounded-none"
                      placeholder="Tax %"
                      value={item.tax}
                      onchange={(e) =>
                        handleLineItemChange(idx, 'tax', e.target.value)
                      }
                    />
                  </div>
                )}
              </div>
            ))}
            <div className="flex items-center justify-between mt-2">
              <div className="text-gray-700 font-medium">Total</div>
              <div className="text-lg font-medium">XAF{total.toFixed(2)}</div>
            </div>
            <button
              type="button"
              className="mt-3 px-4 py-2 border rounded-none text-sm text-gray-700 hover:bg-gray-100"
              onClick={addLineItem}
            >
              + Add line item
            </button>
          </div>
        </div>
      </div>
      {/* Dynamic questions from builder */}
      <form className="flex flex-col gap-8">
        {questions.length === 0 && (
          <div className="text-gray-400 text-center py-12">
            No questions to preview
          </div>
        )}
        {questions.map((q, idx) => (
          <div key={q.id} className="flex flex-col gap-2">
            {/* Section label for department fields */}

            {/* Question label */}
            <label className="block text-base font-medium text-gray-900 mb-1">
              {q.title || 'Untitled question'}
              {q.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {q.description && (
              <div className="text-xs text-gray-500 mb-1">{q.description}</div>
            )}
            {/* Render input preview by type */}
            {(() => {
              switch (q.type) {
                case 'vendor':
                  return (
                    <SearchableSelect
                      options={mockVendors}
                      selectedValue={q.options?.[0] || ''}
                      onChange={(val) => {
                        // update the vendor selection in the preview state (if needed)
                        q.options = [val];
                      }}
                      bg="bg-white"
                      name="Vendor"
                      SelectClass="rounded-none"
                    />
                  );
                case 'text':
                  return (
                    <Input
                      className="bg-gray-50"
                      placeholder="Enter your answer"
                    />
                  );
                case 'paragraph':
                  return (
                    <textarea
                      className="bg-gray-50 border border-input w-full min-h-[80px] px-3 py-2 text-base rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
                      placeholder="Enter your answer"
                    />
                  );
                case 'boolean':
                  return (
                    <div className="flex items-center gap-2">
                      <Switch checked={false} disabled />
                      <span className="text-xs text-gray-500">Yes / No</span>
                    </div>
                  );
                case 'number':
                  return (
                    <Input
                      className="bg-gray-50"
                      type="number"
                      placeholder="0"
                    />
                  );
                case 'date':
                  return (
                    <CustomDatePicker
                      label=""
                      placeholder="Pick a date"
                      value={null}
                      onChange={() => {}}
                      isRequired={q.required}
                      className="w-full"
                      disabled
                    />
                  );
                case 'link':
                  return (
                    <Input
                      className="bg-gray-50"
                      type="url"
                      placeholder="https://"
                    />
                  );
                case 'email':
                  return (
                    <Input
                      className="bg-gray-50"
                      type="email"
                      placeholder="email@example.com"
                    />
                  );
                case 'single_select':
                  return (
                    <ShadcnSelect disabled>
                      <SelectTrigger className="bg-gray-50">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {(q.options || []).map((opt: string, i: number) => (
                          <SelectItem key={i} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </ShadcnSelect>
                  );
                case 'multi_select':
                  return (
                    <div className="flex flex-wrap gap-3">
                      {(q.options || []).map((opt: string, i: number) => (
                        <label
                          key={i}
                          className="flex items-center gap-2 text-sm text-gray-700"
                        >
                          <Checkbox checked={false} disabled />
                          {opt}
                        </label>
                      ))}
                    </div>
                  );
                case 'file_upload':
                  return (
                    <FileUpload
                      files={[]}
                      setFiles={() => {}}
                      maxFiles={1}
                      maxSizeMB={5}
                      // label=""
                    />
                  );
                case 'address':
                  return <Input className="bg-gray-50" placeholder="Address" />;
                case 'contact':
                  return (
                    <Input className="bg-gray-50" placeholder="Contact info" />
                  );
                default:
                  return <Input className="bg-gray-50" placeholder={q.title} />;
              }
            })()}
          </div>
        ))}
      </form>
    </div>
  );
};

export default FormPreview;
