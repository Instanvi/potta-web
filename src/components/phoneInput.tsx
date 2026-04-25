'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { Country } from 'country-state-city';

interface BaseInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  whatsapp?: boolean;
  onChange?: (value: string, metadata: PhoneMetadata) => void;
  errors?: string; // Add errors prop for external validation
  required?: boolean; // Add required prop
}

interface PhoneMetadata {
  formattedValue: string;
  countryCode: string;
  rawInput: string;
  isValid: boolean;
}

interface PhoneInputProps extends BaseInputProps {
  countryCode?: string;
}

interface CountryCodeInfo {
  code: string;
  country: string;
  format: string;
  flag: string;
  isoCode: string;
  id: string;
  minLength: number;
  maxLength: number;
}

// Phone number length requirements by country
const phoneNumberLengths: Record<string, { min: number; max: number }> = {
  // Africa
  CM: { min: 8, max: 9 }, // Cameroon
  NG: { min: 10, max: 11 }, // Nigeria
  ZA: { min: 9, max: 9 }, // South Africa
  KE: { min: 9, max: 10 }, // Kenya
  GH: { min: 9, max: 10 }, // Ghana
  
  // Europe
  GB: { min: 10, max: 11 }, // UK
  FR: { min: 9, max: 9 }, // France
  DE: { min: 10, max: 11 }, // Germany
  IT: { min: 9, max: 10 }, // Italy
  ES: { min: 9, max: 9 }, // Spain
  
  // North America
  US: { min: 10, max: 10 }, // USA
  CA: { min: 10, max: 10 }, // Canada
  MX: { min: 10, max: 10 }, // Mexico
  
  // Asia
  CN: { min: 11, max: 13 }, // China
  JP: { min: 10, max: 11 }, // Japan
  IN: { min: 10, max: 10 }, // India
  
  // Default for other countries
  default: { min: 7, max: 15 },
};

// Common phone number formats by region
const phoneFormats: Record<string, string> = {
  AF: 'X XX XX XX XX', // Africa
  AS: 'XXX XXXX XXXX', // Asia
  EU: 'XXX XXX XXXX', // Europe
  NA: 'XXX XXX XXXX', // North America
  SA: 'XXX XXX XXXX', // South America
  OC: 'XXX XXX XXX', // Oceania
  default: 'XXX XXX XXXX',
};

// Helper to determine format based on continent/region
const getFormatForCountry = (isoCode: string): string => {
  const africanCountries = ['CM', 'NG', 'ZA', 'KE', 'GH', 'SN', 'CI'];
  const europeanCountries = ['GB', 'FR', 'DE', 'IT', 'ES', 'NL'];
  const asianCountries = ['CN', 'JP', 'IN', 'KR', 'SG'];
  const northAmericanCountries = ['US', 'CA', 'MX'];

  if (africanCountries.includes(isoCode)) return phoneFormats.AF;
  if (europeanCountries.includes(isoCode)) return phoneFormats.EU;
  if (asianCountries.includes(isoCode)) return phoneFormats.AS;
  if (northAmericanCountries.includes(isoCode)) return phoneFormats.NA;

  return phoneFormats.default;
};

// Get phone number length requirements for a country
const getPhoneLengthForCountry = (
  isoCode: string
): { min: number; max: number } => {
  return phoneNumberLengths[isoCode] || phoneNumberLengths.default;
};

// Generate flag URL from country code
const getFlagUrl = (isoCode: string): string => {
  return `https://flagcdn.com/w20/${isoCode.toLowerCase()}.png`;
};

export function PhoneInput({
  label,
  placeholder,
  value = '',
  onChange,
  whatsapp,
  countryCode = '+237',
  errors, // Add errors prop
  required = false, // Add required prop
}: PhoneInputProps) {
  // Store the raw phone number input (without country code)
  const [phoneNumber, setPhoneNumber] = useState(value);
  
  // Store the selected country code separately
  const [selectedCountryCode, setSelectedCountryCode] = useState(countryCode);
  
  const [isWhatsApp, setIsWhatsApp] = useState(whatsapp || false);
  const [countryCodes, setCountryCodes] = useState<CountryCodeInfo[]>([]);
  const [selectedCountryInfo, setSelectedCountryInfo] =
    useState<CountryCodeInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Flag to prevent initial render effect conflicts
  const isInitialMount = useRef(true);
  
  // Store the last selected country to prevent unnecessary updates
  const lastSelectedCountry = useRef<string | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update the country code when the prop changes
  useEffect(() => {
    if (
      countryCode &&
      countryCode !== selectedCountryCode &&
      !isInitialMount.current
    ) {
      setSelectedCountryCode(countryCode);
      lastSelectedCountry.current = countryCode;
    }
  }, [countryCode]);

  // Update phone number when value prop changes
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setPhoneNumber(value);
    }
  }, [value]);

  // Load country codes on component mount
  useEffect(() => {
    const loadCountryCodes = async () => {
      setIsLoading(true);
      try {
        const countries = Country.getAllCountries();

        // Create a map to handle duplicate country codes
        const codeMap = new Map<string, CountryCodeInfo[]>();

        countries.forEach((country) => {
          let callingCode = '';
          try {
            callingCode = `+${country.phonecode}`;
          } catch (error) {
            console.error(
              `Error getting calling code for ${country.name}:`,
              error
            );
            return; // Skip this country
          }

          if (!callingCode || callingCode === '+') return; // Skip invalid codes

          const lengthRequirements = getPhoneLengthForCountry(country.isoCode);

          const countryInfo: CountryCodeInfo = {
            code: callingCode,
            country: country.name,
            format: getFormatForCountry(country.isoCode),
            flag: getFlagUrl(country.isoCode),
            isoCode: country.isoCode,
            id: `${country.isoCode}-${callingCode}`, // Create unique ID
            minLength: lengthRequirements.min,
            maxLength: lengthRequirements.max,
          };

          if (!codeMap.has(callingCode)) {
            codeMap.set(callingCode, []);
          }
          codeMap.get(callingCode)?.push(countryInfo);
        });

        // Process the map to create a deduplicated array
        const processedCodes: CountryCodeInfo[] = [];
        codeMap.forEach((countries, code) => {
          countries.forEach((country) => {
            processedCodes.push(country);
          });
        });

        // Sort by country name for better UX
        processedCodes.sort((a, b) => a.country.localeCompare(b.country));

        setCountryCodes(processedCodes);

        // Set the initial selected country info
        const initialCountry =
          processedCodes.find((c) => c.code === selectedCountryCode) ||
          (processedCodes.length > 0 ? processedCodes[0] : null);

        if (initialCountry) {
          setSelectedCountryCode(initialCountry.code);
          setSelectedCountryInfo(initialCountry);
          lastSelectedCountry.current = initialCountry.code;
        }
      } catch (error) {
        console.error('Error loading country codes:', error);
        // Fallback to some default countries if API fails
        const fallbackCountries = [
          {
            code: '+237',
            country: 'Cameroon',
            format: 'X XX XX XX XX',
            flag: getFlagUrl('CM'),
            isoCode: 'CM',
            id: 'CM-237',
            minLength: 8,
            maxLength: 9,
          },
          {
            code: '+1',
            country: 'United States',
            format: 'XXX XXX XXXX',
            flag: getFlagUrl('US'),
            isoCode: 'US',
            id: 'US-1',
            minLength: 10,
            maxLength: 10,
          },
          {
            code: '+44',
            country: 'United Kingdom',
            format: 'XXXX XXXXXX',
            flag: getFlagUrl('GB'),
            isoCode: 'GB',
            id: 'GB-44',
            minLength: 10,
            maxLength: 11,
          },
        ];
        setCountryCodes(fallbackCountries);

        // Set initial country from fallback
        const initialCountry =
          fallbackCountries.find((c) => c.code === selectedCountryCode) ||
          fallbackCountries[0];
        setSelectedCountryCode(initialCountry.code);
        setSelectedCountryInfo(initialCountry);
        lastSelectedCountry.current = initialCountry.code;
      } finally {
        setIsLoading(false);
        isInitialMount.current = false;
      }
    };

    loadCountryCodes();
  }, []); // Only run on mount

  // Update selected country info when country code changes
  useEffect(() => {
    // Skip if this is the initial mount
    if (isInitialMount.current) return;
    
    // Skip if the country code hasn't actually changed
    if (lastSelectedCountry.current === selectedCountryCode) return;
    
    const countryInfo =
      countryCodes.find((c) => c.code === selectedCountryCode) || null;
      
    if (countryInfo) {
      setSelectedCountryInfo(countryInfo);
      lastSelectedCountry.current = selectedCountryCode;
      
      // Validate current phone number with new country requirements
      if (phoneNumber) {
        validatePhoneNumber(phoneNumber.replace(/\D/g, ''), countryInfo);
      }
    }
  }, [selectedCountryCode, countryCodes, phoneNumber]);

  // Validate phone number against country requirements
  const validatePhoneNumber = (
    digits: string,
    countryInfo?: CountryCodeInfo | null
  ): boolean => {
    const country = countryInfo || selectedCountryInfo;
    if (!country) return true; // Can't validate without country info
    
    const length = digits.length;
    
    if (length === 0) {
      setValidationError(null);
      return true; // Empty is valid (for now)
    }
    
    if (length < country.minLength) {
      setValidationError(
        `Phone number too short. ${country.country} numbers should be at least ${country.minLength} digits.`
      );
      return false;
    }
    
    if (length > country.maxLength) {
      setValidationError(
        `Phone number too long. ${country.country} numbers should be at most ${country.maxLength} digits.`
      );
      return false;
    }
    
    // Additional country-specific validation could go here
    
    setValidationError(null);
    return true;
  };

  // Format phone number for display
  const formatPhoneNumber = (input: string): string => {
    // Remove any non-digit characters from the input
    const cleaned = input.replace(/\D/g, '');
    if (cleaned.length === 0) return '';

    const format = selectedCountryInfo?.format || 'XXX XXX XXX';

    let formatted = '';
    let digitIndex = 0;

    // Apply the format pattern
    for (let i = 0; i < format.length && digitIndex < cleaned.length; i++) {
      if (format[i] === 'X') {
        formatted += cleaned[digitIndex];
        digitIndex++;
      } else {
        formatted += format[i];
        // Don't add extra spaces at the end
        if (digitIndex < cleaned.length) {
          formatted += '';
        }
      }
    }

    // Add any remaining digits that don't fit the format
    if (digitIndex < cleaned.length) {
      formatted += cleaned.substring(digitIndex);
    }

    return formatted;
  };

  // Notify parent component with combined value and metadata
  const notifyChange = (rawInput: string) => {
    if (onChange) {
      // Get the digits-only version of the raw input
      const digitsOnly = rawInput.replace(/\D/g, '');
      
      // Format the raw input for display
      const formattedValue = formatPhoneNumber(digitsOnly);
      
      // The combined value includes the country code + raw digits
      const combinedValue = `${selectedCountryCode}${digitsOnly}`;

      // Validate the phone number
      const isValid = validatePhoneNumber(digitsOnly);

      // Pass combined value and metadata to parent
      onChange(combinedValue, {
        formattedValue: formattedValue,
        countryCode: selectedCountryCode,
        rawInput: digitsOnly,
        isValid: isValid,
      });
    }
  };

  // Handle phone number input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digitsOnly = input.replace(/\D/g, '');
    const maxLength = selectedCountryInfo?.maxLength || 15; // Use country-specific max length

    if (digitsOnly.length <= maxLength + 5) {
      // Allow slightly more than max for validation feedback
      // Format the number for display
      const formatted = formatPhoneNumber(digitsOnly);
      setPhoneNumber(formatted);
      
      // Notify parent with the raw input
      notifyChange(digitsOnly);
    }
  };

  // Handle country code selection - FIXED to ensure selection sticks
  const handleCountryCodeChange = (country: CountryCodeInfo) => {
    // Immediately update the local state
    setSelectedCountryCode(country.code);
    setSelectedCountryInfo(country);
    lastSelectedCountry.current = country.code; // Update the ref to prevent unnecessary re-renders
    setDropdownOpen(false);

    // Validate the current phone number with the new country
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    validatePhoneNumber(digitsOnly, country);

    // Notify parent with the same phone number but updated country code
    notifyChange(digitsOnly);
  };

  // Handle WhatsApp toggle
  const handleWhatsAppToggle = (checked: boolean) => {
    setIsWhatsApp(checked);
    // You could notify the parent component about the WhatsApp status change here if needed
  };

  // Determine input border color based on validation state
  const getBorderClass = () => {
    if (!phoneNumber || phoneNumber.length === 0) return 'border-gray-200'; // Default
    if (errors || validationError) return 'border-red-500'; // Error (external or internal)
    return 'border-green-500'; // Valid
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between items-center">
        <p className="font-medium mb-1 w-fit">
          {label} {required && <span className="text-red-500">*</span>}
        </p>
        {whatsapp && (
          <WhatsAppToggle
            checked={isWhatsApp}
            onChange={handleWhatsAppToggle}
          />
        )}
      </div>
      <div className="flex gap-[1px]">
        {/* Country code dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center py-2.5 border border-r-0 ${
              errors || validationError ? 'border-red-500' : 'border-gray-200'
            } px-3 bg-white cursor-pointer focus:ring-2 focus:ring-green-500 outline-none min-w-[90px] justify-between`}
            disabled={isLoading}
            aria-label="Select country code"
          >
            <div className="flex items-center gap-2">
              {selectedCountryInfo && (
                <div className="w-5 h-4 relative overflow-hidden">
                  <img
                    src={selectedCountryInfo.flag}
                    alt={`${selectedCountryInfo.country} flag`}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <span>{selectedCountryCode}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {/* Country dropdown menu */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 z-10 bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto w-64">
              {isLoading ? (
                <div className="p-3 text-center">Loading countries...</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {countryCodes.map((country) => (
                    <button
                      key={country.id}
                      type="button"
                      onClick={() => handleCountryCodeChange(country)}
                      className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 text-left"
                    >
                      <div className="w-6 h-4 relative overflow-hidden">
                        <img
                          src={country.flag}
                          alt={`${country.country} flag`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {country.country}
                        </div>
                        <div className="text-xs text-gray-500">
                          {country.code}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Phone number input */}
        <input
          type="tel"
          placeholder={placeholder || 'Enter phone number'}
          value={phoneNumber}
          onChange={handleInputChange}
          className={`outline-none focus:ring-2 focus:ring-green-500 border ${getBorderClass()} p-2 flex-1 py-2.5`}
          aria-label="Phone number"
          aria-invalid={!!(errors || validationError)}
        />
      </div>
      
      {/* Display selected country info */}
      {selectedCountryInfo && (
        <div className="text-xs text-gray-500 mt-1">
          {selectedCountryInfo.country} ({selectedCountryInfo.code}) - Expected
          length: {selectedCountryInfo.minLength}
          {selectedCountryInfo.minLength !== selectedCountryInfo.maxLength
            ? `-${selectedCountryInfo.maxLength}`
            : ''}{' '}
          digits
        </div>
      )}
      
      {/* Display validation error */}
      {(errors || validationError) && (
        <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
          <AlertCircle className="w-3 h-3" />
          <span>{errors || validationError}</span>
        </div>
      )}
    </div>
  );
}

interface WhatsAppToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function WhatsAppToggle({ checked, onChange }: WhatsAppToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <span>WhatsApp No?</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-green-500' : 'bg-gray-300'
        } relative`}
        aria-checked={checked}
        role="switch"
      >
        <div
          className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
