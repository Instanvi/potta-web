import React, { useState } from 'react';
import Slider from '@potta/components/slideover';
import Input from '@potta/components/input';
import Button from '@potta/components/button';
import SearchableSelect from '@potta/components/searchableSelect';
import Checkbox from '@potta/components/checkbox';
import { useCreateDeduction } from '../hooks/useCreateDeduction';
import toast from 'react-hot-toast';
import { createDeductionSchema } from '../utils/validations';

const typeOptions = [
  { label: 'Standard', value: 'Standard' },
  { label: 'Custom', value: 'Custom' },
];
const modeOptions = [
  { label: 'Fixed', value: 'Fixed' },
  { label: 'Percentage', value: 'Percentage' },
];
const appliesToOptions = [
  { label: 'Salary', value: 'Salary' },
  { label: 'Bonus', value: 'Bonus' },
  { label: 'All', value: 'All' },
];

const defaultBrackets = [{ min: '', max: '', rate: '' }];

const AddDeductionSlideover = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Standard');
  const [mode, setMode] = useState('Fixed');
  const [value, setValue] = useState('');
  const [isTax, setIsTax] = useState(false);
  const [appliesTo, setAppliesTo] = useState('Salary');
  const [isActive, setIsActive] = useState(true);
  const [isEditable, setIsEditable] = useState(true);
  const [brackets, setBrackets] = useState(defaultBrackets);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const createDeduction = useCreateDeduction();

  const handleAddBracket = () => {
    setBrackets([...brackets, { min: '', max: '', rate: '' }]);
  };
  const handleBracketChange = (idx: number, field: string, val: string) => {
    setBrackets(
      brackets.map((b, i) => (i === idx ? { ...b, [field]: val } : b))
    );
  };
  const handleRemoveBracket = (idx: number) => {
    setBrackets(brackets.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    // Prepare payload
    const payload = {
      name,
      description,
      type,
      mode,
      value: value === '' ? '' : isNaN(Number(value)) ? value : Number(value),
      brackets: brackets.map((b) => ({
        min: b.min === '' || isNaN(Number(b.min)) ? 0 : Number(b.min),
        max: b.max === '' || isNaN(Number(b.max)) ? 0 : Number(b.max),
        rate: b.rate === '' || isNaN(Number(b.rate)) ? 0 : Number(b.rate),
      })),
      is_tax: isTax,
      applies_to: appliesTo,
      is_active: isActive,
      is_editable: isEditable,
    };
    try {
      await createDeductionSchema.validate(payload, { abortEarly: false });
    } catch (validationError: any) {
      const errors: Record<string, string> = {};
      if (validationError.inner && validationError.inner.length > 0) {
        validationError.inner.forEach((err: any) => {
          if (err.path) errors[err.path] = err.message;
        });
      } else if (validationError.path) {
        errors[validationError.path] = validationError.message;
      }
      setFormErrors(errors);
      return;
    }
    setLoading(true);
    try {
      await createDeduction.mutateAsync(payload);
      toast.success('Deduction created successfully!');
      setOpen(false);
      setName('');
      setDescription('');
      setType('Standard');
      setMode('Fixed');
      setValue('');
      setIsTax(false);
      setAppliesTo('Salary');
      setIsActive(true);
      setIsEditable(true);
      setBrackets(defaultBrackets);
      setFormErrors({});
    } catch (err) {
      toast.error('Failed to create deduction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Slider
      edit={false}
      buttonText="deductions"
      open={open}
      setOpen={setOpen}
      title="Add Deduction"
    >
      <form
        className="grid h-fit grid-cols-2 gap-4 w-full max-w-4xl p-4"
        onSubmit={handleSubmit}
      >
        <div className="col-span-2">
          <Input
            label="Name"
            type="text"
            name="name"
            value={name}
            onchange={(e) => setName(e.target.value)}
            required
            errors={formErrors.name}
          />
        </div>
        <div className="col-span-2">
          <Input
            label="Description"
            type="text"
            name="description"
            value={description}
            onchange={(e) => setDescription(e.target.value)}
            errors={formErrors.description}
          />
        </div>
        <SearchableSelect
          label="Type"
          options={typeOptions}
          selectedValue={type}
          onChange={setType}
          required
          error={formErrors.type}
          placeholder="Select type"
        />
        <SearchableSelect
          label="Mode"
          options={modeOptions}
          selectedValue={mode}
          onChange={setMode}
          required
          error={formErrors.mode}
          placeholder="Select mode"
        />
        <Input
          label="Value"
          name="value"
          type="number"
          value={value}
          onchange={(e) => setValue(e.target.value)}
          errors={formErrors.value}
          min={0}
        />
        <SearchableSelect
          label="Applies To"
          options={appliesToOptions}
          selectedValue={appliesTo}
          onChange={setAppliesTo}
          required
          error={formErrors.applies_to}
          placeholder="Select applies to"
        />
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Brackets</label>
          {brackets.map((b, idx) => (
            <div key={idx} className="flex gap-2 mb-2 items-center">
              <Input
                label="Min"
                type="number"
                name={`min-${idx}`}
                value={b.min}
                onchange={(e) =>
                  handleBracketChange(idx, 'min', e.target.value)
                }
                min={0}
                errors={formErrors[`brackets.${idx}.min`]}
              />
              <Input
                label="Max"
                type="number"
                name={`max-${idx}`}
                value={b.max}
                onchange={(e) =>
                  handleBracketChange(idx, 'max', e.target.value)
                }
                min={0}
                errors={formErrors[`brackets.${idx}.max`]}
              />
              <Input
                label="Rate"
                type="number"
                name={`rate-${idx}`}
                value={b.rate}
                onchange={(e) =>
                  handleBracketChange(idx, 'rate', e.target.value)
                }
                min={0}
                errors={formErrors[`brackets.${idx}.rate`]}
              />
              {brackets.length > 1 && (
                <button
                  type="button"
                  className="ml-2 p-1 rounded-full hover:bg-red-100 text-red-600 transition"
                  title="Remove Bracket"
                  onClick={() => handleRemoveBracket(idx)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
              )}
            </div>
          ))}
          <button
            type="button"
            className="flex items-center gap-1 text-green-700 font-medium mt-2 px-3 py-1 rounded hover:bg-green-50 border border-green-200 transition"
            onClick={handleAddBracket}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Bracket
          </button>
        </div>
        <div className="col-span-2 flex gap-4 mt-2">
          <Checkbox
            id="isTax"
            label="Is Tax"
            checked={isTax}
            onChange={setIsTax}
          />
          <Checkbox
            id="isActive"
            label="Active"
            checked={isActive}
            onChange={setIsActive}
          />
          <Checkbox
            id="isEditable"
            label="Editable"
            checked={isEditable}
            onChange={setIsEditable}
          />
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-2 bg-white border-t border-gray-200 flex justify-end space-x-3">
          <Button
            text="Save Deduction"
            type="submit"
            isLoading={loading}
            disabled={loading}
          />
        </div>
      </form>
    </Slider>
  );
};

export default AddDeductionSlideover;
