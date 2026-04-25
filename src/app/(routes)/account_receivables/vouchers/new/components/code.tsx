'use client';

import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';

interface CodeProps {
  // Add any props if needed
}

const Code: React.FC<CodeProps> = () => {
  const { register, watch, setValue, getValues, formState: { errors }, trigger } = useFormContext();
  const [hasAdvancedSettings, setHasAdvancedSettings] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Watch for code and advanced settings fields
  const code = watch('code');
  const programCardPrefix = watch('programCardPrefix');
  const codeSettingsLength = watch('codeSettings.length');
  const codeSettingsPrefix = watch('codeSettings.prefix');
  const codeSettingsPostfix = watch('codeSettings.postfix');
  const codeSettingsPattern = watch('codeSettings.pattern');
  const codeSettingsCharacterSet = watch('codeSettings.characterSet');
  
  // Check if we have either a code or valid advanced settings
  const hasCode = !!code;
  const hasProgramCardPrefix = !!programCardPrefix;
  const hasValidAdvancedSettings = hasAdvancedSettings && 
    !!codeSettingsLength && 
    !!codeSettingsPrefix && 
    !!codeSettingsPostfix && 
    !!codeSettingsPattern && 
    !!codeSettingsCharacterSet;
  
  // Reactive validation
  useEffect(() => {
    const errors: string[] = [];
    
    // Program card prefix is always required
    if (!programCardPrefix) {
      errors.push("Program card prefix is required");
    }
    
    if (hasAdvancedSettings) {
      if (!codeSettingsLength) errors.push("Code length is required");
      if (!codeSettingsPrefix) errors.push("Code prefix is required");
      if (!codeSettingsPostfix) errors.push("Code postfix is required");
      if (!codeSettingsPattern) errors.push("Pattern is required");
      if (!codeSettingsCharacterSet) errors.push("Character set is required");
    } else if (!hasCode) {
      errors.push("Code is required if not using advanced settings");
    }
    
    setValidationErrors(errors);
  }, [
    hasAdvancedSettings, 
    code, 
    programCardPrefix,
    codeSettingsLength, 
    codeSettingsPrefix, 
    codeSettingsPostfix, 
    codeSettingsPattern, 
    codeSettingsCharacterSet
  ]);
  
  // Validate the code tab
  const validateCodeTab = () => {
    // Program card prefix is always required
    if (!programCardPrefix) {
      return false;
    }
    
    // Either need a code or valid advanced settings
    if (hasAdvancedSettings) {
      return hasValidAdvancedSettings;
    } else {
      return hasCode;
    }
  };
  
  // Add a hidden validation button that can be triggered from the parent
  useEffect(() => {
    // Create a hidden button for validation
    const validateButton = document.createElement('button');
    validateButton.id = 'validate-code';
    validateButton.style.display = 'none';
    validateButton.onclick = () => validateCodeTab();
    
    document.body.appendChild(validateButton);
    
    return () => {
      document.body.removeChild(validateButton);
    };
  }, [hasCode, hasValidAdvancedSettings, programCardPrefix]);

  // Toggle between simple code and advanced settings
  const toggleAdvancedSettings = () => {
    if (hasAdvancedSettings) {
      // Switching from advanced to simple
      setValue('codeSettings.length', '');
      setValue('codeSettings.prefix', '');
      setValue('codeSettings.postfix', '');
      setValue('codeSettings.pattern', '');
      setValue('codeSettings.characterSet', '');
      setHasAdvancedSettings(false);
    } else {
      // Switching from simple to advanced
      setValue('code', '');
      setHasAdvancedSettings(true);
    }
  };

  return (
    <div className="bg-white p-6">
      <h3 className="text-xl font-medium mb-8">Code Settings</h3>
      
      {/* Validation Error Messages - Only show on submit or when fields are touched */}
      {validationErrors.length > 0 && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <h4 className="text-red-600 font-medium">Please fix the following errors:</h4>
          </div>
          <ul className="list-disc pl-5 text-red-500 text-sm">
            {validationErrors.map((error, index) => (
              <li key={index} className="code-error">{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Simple Code Input */}
      {!hasAdvancedSettings && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('code')}
            className={`w-1/2 border ${!hasCode ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
            placeholder="SAVE20"
          />
          {!hasCode && (
            <p className="mt-1 text-sm text-red-500">
              Enter a code or use advanced settings
            </p>
          )}
        </div>
      )}
      
      <div className="space-y-6 w-3/5">
        {/* Program Card Prefix - Now marked as required */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Program Card Prefix <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('programCardPrefix', { required: true })}
            className={`w-1/2 border ${!hasProgramCardPrefix ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
            placeholder="Program-02152"
          />
          {!hasProgramCardPrefix && (
            <p className="mt-1 text-sm text-red-500">
              Program card prefix is required
            </p>
          )}
        </div>

        {/* Maximum Entries */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Entries
          </label>
          <input
            type="number"
            {...register('usageLimit')}
            className="w-1/2 border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="55"
          />
        </div>

        {/* Advanced Code Settings Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Advanced code settings
            </label>
            <div
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                hasAdvancedSettings ? 'bg-green-500' : 'bg-gray-200'
              }`}
              onClick={toggleAdvancedSettings}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  hasAdvancedSettings ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {hasAdvancedSettings 
              ? "Configure advanced code settings (code will be generated automatically)" 
              : "Switch to advanced settings to generate codes automatically"}
          </p>
        </div>

        {/* Advanced Code Settings Fields */}
        {hasAdvancedSettings && (
          <div className="border-dotted border border-gray-200 p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code Prefix <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('codeSettings.prefix', { 
                    required: hasAdvancedSettings 
                  })}
                  className={`w-full border ${!codeSettingsPrefix && hasAdvancedSettings ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                  placeholder="ABC"
                />
                {!codeSettingsPrefix && hasAdvancedSettings && (
                  <p className="mt-1 text-sm text-red-500">Required</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code Postfix <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('codeSettings.postfix', { 
                    required: hasAdvancedSettings 
                  })}
                  className={`w-full border ${!codeSettingsPostfix && hasAdvancedSettings ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                  placeholder="XYZ"
                />
                {!codeSettingsPostfix && hasAdvancedSettings && (
                  <p className="mt-1 text-sm text-red-500">Required</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code length <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register('codeSettings.length', { 
                    required: hasAdvancedSettings 
                  })}
                  className={`w-full border ${!codeSettingsLength && hasAdvancedSettings ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                  placeholder="11"
                />
                {!codeSettingsLength && hasAdvancedSettings && (
                  <p className="mt-1 text-sm text-red-500">Required</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pattern <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('codeSettings.pattern', { 
                    required: hasAdvancedSettings 
                  })}
                  className={`w-full border ${!codeSettingsPattern && hasAdvancedSettings ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                  placeholder="#125###120"
                />
                {!codeSettingsPattern && hasAdvancedSettings && (
                  <p className="mt-1 text-sm text-red-500">Required</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Character Set <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('codeSettings.characterSet', { 
                    required: hasAdvancedSettings 
                  })}
                  className={`w-full border ${!codeSettingsCharacterSet && hasAdvancedSettings ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                  placeholder="01223456789abcdefghijklmnopirstuvwxyz"
                />
                {!codeSettingsCharacterSet && hasAdvancedSettings && (
                  <p className="mt-1 text-sm text-red-500">Required</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Code;
