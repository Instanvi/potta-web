'use client';

import Input from '@potta/components/input';

/** Short unique document number, e.g. 251125-4821. */
export function generateDocumentNumber(): string {
  const now = new Date();
  const stamp = [
    String(now.getFullYear()).slice(2),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${stamp}-${rand}`;
}

export function GenerateNumberButton({ onGenerate }: { onGenerate: (value: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onGenerate(generateDocumentNumber())}
      className="mt-1 text-sm font-medium text-primary hover:underline"
    >
      Generate
    </button>
  );
}

type GeneratedNumberFieldProps = {
  label?: React.ReactNode;
  name: string;
  value: string;
  onChange: (value: string) => void;
  errors?: { message: string } | string;
  placeholder?: string;
  required?: boolean;
};

/** Text number with a Generate action that fills a unique value. */
export function GeneratedNumberField({
  label,
  name,
  value,
  onChange,
  errors,
  placeholder,
  required,
}: GeneratedNumberFieldProps) {
  return (
    <div className="w-full">
      <Input
        type="text"
        label={label}
        name={name}
        value={value}
        onchange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        errors={typeof errors === 'string' ? { message: errors } : errors}
      />
      <GenerateNumberButton onGenerate={onChange} />
    </div>
  );
}
