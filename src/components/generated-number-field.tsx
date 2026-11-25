'use client';

import Input from '@potta/components/input';

/** Short unique body, e.g. 251125-4821. Pass an acronym to get INV-251125-4821. */
export function generateDocumentNumber(acronym?: string): string {
  const now = new Date();
  const stamp = [
    String(now.getFullYear()).slice(2),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const rand = Math.floor(1000 + Math.random() * 9000);
  const body = `${stamp}-${rand}`;
  const prefix = acronym?.trim().toUpperCase();
  return prefix ? `${prefix}-${body}` : body;
}

/** Invoice and bill numbers always start with their acronym (INV-…, BILL-…). */
export function withDocumentAcronym(value: string, acronym: string): string {
  const prefix = acronym.trim().toUpperCase();
  const raw = value.trim();
  if (!prefix) return raw;
  if (!raw) return '';
  const upper = raw.toUpperCase();
  if (upper.startsWith(`${prefix}-`)) return `${prefix}-${raw.slice(prefix.length + 1)}`;
  if (upper.startsWith(prefix)) {
    const rest = raw.slice(prefix.length).replace(/^[\s-]+/, '');
    return rest ? `${prefix}-${rest}` : `${prefix}-`;
  }
  return `${prefix}-${raw}`;
}

export function GenerateNumberButton({
  onGenerate,
  acronym,
}: {
  onGenerate: (value: string) => void;
  /** When set, the generated value is prefixed, e.g. INV- or BILL-. */
  acronym?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onGenerate(generateDocumentNumber(acronym))}
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
  /** Document acronym kept on the value, e.g. INV or BILL. */
  acronym?: string;
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
  acronym,
}: GeneratedNumberFieldProps) {
  return (
    <div className="w-full">
      <Input
        type="text"
        label={label}
        name={name}
        value={value}
        onchange={(e) => onChange(e.target.value)}
        onBlur={() => {
          if (acronym && String(value).trim()) onChange(withDocumentAcronym(String(value), acronym));
        }}
        placeholder={placeholder || (acronym ? `${acronym.toUpperCase()}-` : undefined)}
        required={required}
        errors={typeof errors === 'string' ? { message: errors } : errors}
      />
      <GenerateNumberButton acronym={acronym} onGenerate={onChange} />
    </div>
  );
}
