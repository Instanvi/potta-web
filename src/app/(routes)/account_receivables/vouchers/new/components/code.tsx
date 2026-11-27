'use client';

import { useFormContext } from 'react-hook-form';
import Input from '@potta/components/input';
import { Switch } from '@potta/components/shadcn/switch';
import { GeneratedNumberField } from '@potta/components/generated-number-field';

const DEFAULT_CHARACTER_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const DEFAULT_CODE_LENGTH = 8;

function randomLetters(count: number) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let out = '';
  for (let i = 0; i < count; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function patternForLength(length: number) {
  const n = Math.max(4, Math.min(16, Math.floor(Number(length) || DEFAULT_CODE_LENGTH)));
  const left = Math.ceil(n / 2);
  const right = n - left;
  return `${'#'.repeat(left)}-${'#'.repeat(right)}`;
}

function GenerateFieldButton({
  onGenerate,
  label = 'Generate',
}: {
  onGenerate: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onGenerate}
      className="mt-1 text-sm font-medium text-primary hover:underline"
    >
      {label}
    </button>
  );
}

const Code = ({ showErrors = false }: { showErrors?: boolean }) => {
  const { watch, setValue } = useFormContext();
  const hasAdvancedSettings = Boolean(watch('advancedCodeSettings'));
  const code = watch('code') || '';
  const programCardPrefix = watch('programCardPrefix') || '';
  const usageLimit = watch('usageLimit') ?? '';
  const codeSettingsLength = watch('codeSettings.length');
  const codeSettingsPrefix = watch('codeSettings.prefix') || '';
  const codeSettingsPostfix = watch('codeSettings.postfix') || '';
  const codeSettingsPattern = watch('codeSettings.pattern') || '';
  const codeSettingsCharacterSet = watch('codeSettings.characterSet') || '';

  const toggleAdvancedSettings = (next: boolean) => {
    setValue('advancedCodeSettings', next);
    if (next) {
      setValue('code', '');
      fillAdvancedDefaults();
      return;
    }
    setValue('codeSettings.length', '');
    setValue('codeSettings.prefix', '');
    setValue('codeSettings.postfix', '');
    setValue('codeSettings.pattern', '');
    setValue('codeSettings.characterSet', '');
  };

  const fillAdvancedDefaults = () => {
    const length = DEFAULT_CODE_LENGTH;
    setValue('codeSettings.prefix', randomLetters(3), { shouldDirty: true });
    setValue('codeSettings.postfix', randomLetters(3), { shouldDirty: true });
    setValue('codeSettings.length', length, { shouldDirty: true });
    setValue('codeSettings.pattern', patternForLength(length), { shouldDirty: true });
    setValue('codeSettings.characterSet', DEFAULT_CHARACTER_SET, { shouldDirty: true });
  };

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
      {!hasAdvancedSettings ? (
        <div className={showErrors && !code ? 'error-field' : ''}>
          <GeneratedNumberField
            label="Code"
            name="code"
            acronym="VCH"
            required
            value={code}
            onChange={(value) => setValue('code', value, { shouldDirty: true })}
            placeholder="Generate or enter a code"
            errors={
              showErrors && !code
                ? 'Enter a code, or turn on advanced settings'
                : undefined
            }
          />
        </div>
      ) : null}

      <div className={showErrors && !programCardPrefix ? 'error-field' : ''}>
        <GeneratedNumberField
          label="Program card prefix"
          name="programCardPrefix"
          acronym="PROG"
          required
          value={programCardPrefix}
          onChange={(value) =>
            setValue('programCardPrefix', value, { shouldDirty: true })
          }
          placeholder="Generate or enter a prefix"
          errors={
            showErrors && !programCardPrefix
              ? 'Program card prefix is required'
              : undefined
          }
        />
      </div>

      <div>
        <Input
          type="number"
          label="Maximum entries"
          name="usageLimit"
          value={usageLimit}
          onchange={(e) => setValue('usageLimit', e.target.value, { shouldDirty: true })}
          placeholder="100"
          min={1}
        />
        <GenerateFieldButton
          label="Use 100"
          onGenerate={() => setValue('usageLimit', 100, { shouldDirty: true })}
        />
      </div>

      <div className="flex items-center justify-between gap-4 sm:col-span-2">
        <div>
          <p className="text-sm text-foreground">Advanced code settings</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasAdvancedSettings
              ? 'Codes are built from the settings below. Use Generate on any field, or fill all at once.'
              : 'Turn this on to generate codes from prefix, pattern, and character set.'}
          </p>
        </div>
        <Switch checked={hasAdvancedSettings} onCheckedChange={toggleAdvancedSettings} />
      </div>

      {hasAdvancedSettings ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 rounded-[2px] border border-black/[0.08] bg-main-bg/40 p-4 sm:col-span-2 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={fillAdvancedDefaults}
              className="inline-flex h-9 items-center rounded-[2px] border border-primary/30 bg-white px-3 text-sm font-medium text-primary hover:bg-brand-subtle"
            >
              Generate all advanced settings
            </button>
          </div>

          <div className={showErrors && !codeSettingsPrefix ? 'error-field' : ''}>
            <Input
              type="text"
              label="Code prefix"
              name="codeSettings.prefix"
              required
              value={codeSettingsPrefix}
              onchange={(e) =>
                setValue('codeSettings.prefix', e.target.value, { shouldDirty: true })
              }
              placeholder="ABC"
              errors={showErrors && !codeSettingsPrefix ? 'Required' : undefined}
            />
            <GenerateFieldButton
              onGenerate={() =>
                setValue('codeSettings.prefix', randomLetters(3), { shouldDirty: true })
              }
            />
          </div>

          <div className={showErrors && !codeSettingsPostfix ? 'error-field' : ''}>
            <Input
              type="text"
              label="Code postfix"
              name="codeSettings.postfix"
              required
              value={codeSettingsPostfix}
              onchange={(e) =>
                setValue('codeSettings.postfix', e.target.value, { shouldDirty: true })
              }
              placeholder="XYZ"
              errors={showErrors && !codeSettingsPostfix ? 'Required' : undefined}
            />
            <GenerateFieldButton
              onGenerate={() =>
                setValue('codeSettings.postfix', randomLetters(3), { shouldDirty: true })
              }
            />
          </div>

          <div className={showErrors && !codeSettingsLength ? 'error-field' : ''}>
            <Input
              type="number"
              label="Code length"
              name="codeSettings.length"
              required
              min={4}
              max={32}
              value={codeSettingsLength ?? ''}
              onchange={(e) => {
                const next = e.target.value;
                setValue('codeSettings.length', next, { shouldDirty: true });
                if (next && !codeSettingsPattern) {
                  setValue('codeSettings.pattern', patternForLength(Number(next)), {
                    shouldDirty: true,
                  });
                }
              }}
              placeholder="8"
              errors={showErrors && !codeSettingsLength ? 'Required' : undefined}
            />
            <GenerateFieldButton
              label={`Use ${DEFAULT_CODE_LENGTH}`}
              onGenerate={() => {
                setValue('codeSettings.length', DEFAULT_CODE_LENGTH, { shouldDirty: true });
                setValue(
                  'codeSettings.pattern',
                  patternForLength(DEFAULT_CODE_LENGTH),
                  { shouldDirty: true },
                );
              }}
            />
          </div>

          <div className={showErrors && !codeSettingsPattern ? 'error-field' : ''}>
            <Input
              type="text"
              label="Pattern"
              name="codeSettings.pattern"
              required
              value={codeSettingsPattern}
              onchange={(e) =>
                setValue('codeSettings.pattern', e.target.value, { shouldDirty: true })
              }
              placeholder="####-####"
              errors={showErrors && !codeSettingsPattern ? 'Required' : undefined}
            />
            <GenerateFieldButton
              onGenerate={() =>
                setValue(
                  'codeSettings.pattern',
                  patternForLength(Number(codeSettingsLength) || DEFAULT_CODE_LENGTH),
                  { shouldDirty: true },
                )
              }
            />
          </div>

          <div
            className={`sm:col-span-2 ${
              showErrors && !codeSettingsCharacterSet ? 'error-field' : ''
            }`}
          >
            <Input
              type="text"
              label="Character set"
              name="codeSettings.characterSet"
              required
              value={codeSettingsCharacterSet}
              onchange={(e) =>
                setValue('codeSettings.characterSet', e.target.value, {
                  shouldDirty: true,
                })
              }
              placeholder={DEFAULT_CHARACTER_SET}
              errors={showErrors && !codeSettingsCharacterSet ? 'Required' : undefined}
            />
            <div className="mt-1 flex flex-wrap gap-3">
              <GenerateFieldButton
                label="Letters + numbers"
                onGenerate={() =>
                  setValue('codeSettings.characterSet', DEFAULT_CHARACTER_SET, {
                    shouldDirty: true,
                  })
                }
              />
              <GenerateFieldButton
                label="Numbers only"
                onGenerate={() =>
                  setValue('codeSettings.characterSet', '0123456789', {
                    shouldDirty: true,
                  })
                }
              />
              <GenerateFieldButton
                label="Letters only"
                onGenerate={() =>
                  setValue('codeSettings.characterSet', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', {
                    shouldDirty: true,
                  })
                }
              />
            </div>
          </div>

          <div className="sm:col-span-2 rounded-[2px] border border-dashed border-black/10 bg-white p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Pattern preview</p>
            <p className="mt-1 font-mono text-foreground">
              {(codeSettingsPrefix || 'ABC') +
                (codeSettingsPattern || patternForLength(DEFAULT_CODE_LENGTH)) +
                (codeSettingsPostfix || 'XYZ')}
            </p>
            <p className="mt-1 text-xs">
              `#` characters are replaced when the server generates the code on publish.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Code;
