'use client';

import { useFormContext } from 'react-hook-form';
import Input from '@potta/components/input';
import { Switch } from '@potta/components/shadcn/switch';

const Code = ({ showErrors = false }: { showErrors?: boolean }) => {
  const { register, watch, setValue } = useFormContext();
  const hasAdvancedSettings = Boolean(watch('advancedCodeSettings'));
  const code = watch('code');
  const programCardPrefix = watch('programCardPrefix');
  const codeSettingsLength = watch('codeSettings.length');
  const codeSettingsPrefix = watch('codeSettings.prefix');
  const codeSettingsPostfix = watch('codeSettings.postfix');
  const codeSettingsPattern = watch('codeSettings.pattern');
  const codeSettingsCharacterSet = watch('codeSettings.characterSet');

  const toggleAdvancedSettings = (next: boolean) => {
    setValue('advancedCodeSettings', next);
    if (next) {
      setValue('code', '');
      return;
    }
    setValue('codeSettings.length', '');
    setValue('codeSettings.prefix', '');
    setValue('codeSettings.postfix', '');
    setValue('codeSettings.pattern', '');
    setValue('codeSettings.characterSet', '');
  };

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
      {!hasAdvancedSettings ? (
        <div className={showErrors && !code ? 'error-field' : ''}>
          <Input
            type="text"
            label="Code"
            name="code"
            required
            register={register}
            placeholder="SAVE20"
            errors={
              showErrors && !code
                ? 'Enter a code, or turn on advanced settings'
                : undefined
            }
          />
        </div>
      ) : null}

      <div className={showErrors && !programCardPrefix ? 'error-field' : ''}>
        <Input
          type="text"
          label="Program card prefix"
          name="programCardPrefix"
          required
          register={register}
          placeholder="Program-02152"
          errors={
            showErrors && !programCardPrefix
              ? 'Program card prefix is required'
              : undefined
          }
        />
      </div>

      <Input
        type="number"
        label="Maximum entries"
        name="usageLimit"
        register={register}
        placeholder="55"
      />

      <div className="flex items-center justify-between gap-4 sm:col-span-2">
        <div>
          <p className="text-sm text-foreground">Advanced code settings</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasAdvancedSettings
              ? 'A code is generated from the settings below.'
              : 'Turn this on to generate codes instead of typing one.'}
          </p>
        </div>
        <Switch checked={hasAdvancedSettings} onCheckedChange={toggleAdvancedSettings} />
      </div>

      {hasAdvancedSettings ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 rounded-[2px] border border-black/[0.08] bg-main-bg/40 p-4 sm:col-span-2 sm:grid-cols-2">
          <div className={showErrors && !codeSettingsPrefix ? 'error-field' : ''}>
            <Input
              type="text"
              label="Code prefix"
              name="codeSettings.prefix"
              required
              register={register}
              placeholder="ABC"
              errors={showErrors && !codeSettingsPrefix ? 'Required' : undefined}
            />
          </div>
          <div className={showErrors && !codeSettingsPostfix ? 'error-field' : ''}>
            <Input
              type="text"
              label="Code postfix"
              name="codeSettings.postfix"
              required
              register={register}
              placeholder="XYZ"
              errors={showErrors && !codeSettingsPostfix ? 'Required' : undefined}
            />
          </div>
          <div className={showErrors && !codeSettingsLength ? 'error-field' : ''}>
            <Input
              type="number"
              label="Code length"
              name="codeSettings.length"
              required
              register={register}
              placeholder="11"
              errors={showErrors && !codeSettingsLength ? 'Required' : undefined}
            />
          </div>
          <div className={showErrors && !codeSettingsPattern ? 'error-field' : ''}>
            <Input
              type="text"
              label="Pattern"
              name="codeSettings.pattern"
              required
              register={register}
              placeholder="#125###120"
              errors={showErrors && !codeSettingsPattern ? 'Required' : undefined}
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
              register={register}
              placeholder="0123456789abcdefghijklmnopqrstuvwxyz"
              errors={showErrors && !codeSettingsCharacterSet ? 'Required' : undefined}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Code;
