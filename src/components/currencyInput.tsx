'use client';
import { useState, useRef, useEffect, forwardRef, KeyboardEvent } from 'react';
import { Info, ChevronDown, HelpCircle } from 'lucide-react';
import { Country } from 'country-state-city';

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  country: string;
  id: string;
}

// Currency Input Component
interface CurrencyInputProps {
  label?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currency?: string;
  placeholder?: string;
  info?: string;
  required?: boolean;
  error?: string | null;
  disabled?: boolean;
  inputClass?: string;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void; // Add onKeyDown prop
}

// Helper to get flag URL for a country
const getFlagUrl = (isoCode: string): string => {
  return `https://flagcdn.com/w20/${isoCode.toLowerCase()}.png`;
};

// Map of currency codes to symbols
const currencySymbols: Record<string, string> = {
  XAF: 'XAF',
  USD: '$',
  EUR: '€',
  GBP: '£',
  NGN: '₦',
  ZAR: 'R',
  GHS: '₵',
  CAD: 'C$',
  AUD: 'A$',
  INR: '₹',
  JPY: '¥',
  CNY: '¥',
  BRL: 'R$',
  RUB: '₽',
  KRW: '₩',
  CHF: 'CHF',
  SGD: 'S$',
  MXN: '$',
  AED: 'د.إ',
  SEK: 'kr',
  NOK: 'kr',
};

// Convert to forwardRef to support ref passing
const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      label,
      value,
      onChange,
      currency = 'XAF',
      placeholder,
      info,
      disabled,
      required = false,
      error = null,
      inputClass,
      onKeyDown, // Add onKeyDown to props destructuring
    },
    ref // Accept the forwarded ref
  ) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState(currency);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [currencies, setCurrencies] = useState<CurrencyInfo[]>([]);
    const [selectedCurrencyInfo, setSelectedCurrencyInfo] =
      useState<CurrencyInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const userSelectedCurrency = useRef(false);
    const internalRef = useRef<HTMLInputElement>(null);

    // Use the forwarded ref if provided, otherwise use internal ref
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;

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

    // Load currencies from country-state-city API
    useEffect(() => {
      const loadCurrencies = async () => {
        setIsLoading(true);
        try {
          const countries = Country.getAllCountries();

          // Map to store unique currencies
          const currencyMap = new Map<string, CurrencyInfo>();

          countries.forEach((country) => {
            // Some countries might not have currency info
            if (country.currency && country.currency !== '') {
              // Parse the currency string (format: "USD,United States dollar")
              const currencyParts = country.currency.split(',');
              if (currencyParts.length >= 1) {
                const code = currencyParts[0].trim();
                const name =
                  currencyParts.length > 1
                    ? currencyParts[1].trim()
                    : `${country.name} Currency`;

                const currencyInfo: CurrencyInfo = {
                  code,
                  name,
                  symbol: currencySymbols[code] || code,
                  flag: getFlagUrl(country.isoCode),
                  country: country.name,
                  id: `${country.isoCode}-${code}`,
                };

                // Only add if not already in the map
                if (!currencyMap.has(code)) {
                  currencyMap.set(code, currencyInfo);
                }
              }
            }
          });

          // Convert map to array and sort by currency code
          const currencyList = Array.from(currencyMap.values());
          currencyList.sort((a, b) => a.code.localeCompare(b.code));

          setCurrencies(currencyList);

          // Set the initial selected currency info
          const initialCurrency =
            currencyList.find((c) => c.code === currency) ||
            (currencyList.length > 0 ? currencyList[0] : null);

          if (initialCurrency) {
            setSelectedCurrency(initialCurrency.code);
            setSelectedCurrencyInfo(initialCurrency);
          }
        } catch (error) {
          console.error('Error loading currencies:', error);
          // Fallback to some default currencies if API fails
          const fallbackCurrencies = [
            {
              code: 'XAF',
              name: 'Central African CFA franc',
              symbol: 'XAF',
              flag: getFlagUrl('CM'),
              country: 'Cameroon',
              id: 'CM-XAF',
            },
            {
              code: 'USD',
              name: 'US Dollar',
              symbol: '$',
              flag: getFlagUrl('US'),
              country: 'United States',
              id: 'US-USD',
            },
            {
              code: 'EUR',
              name: 'Euro',
              symbol: '€',
              flag: getFlagUrl('FR'),
              country: 'European Union',
              id: 'EU-EUR',
            },
            {
              code: 'GBP',
              name: 'British Pound',
              symbol: '£',
              flag: getFlagUrl('GB'),
              country: 'United Kingdom',
              id: 'GB-GBP',
            },
            {
              code: 'NGN',
              name: 'Nigerian Naira',
              symbol: '₦',
              flag: getFlagUrl('NG'),
              country: 'Nigeria',
              id: 'NG-NGN',
            },
          ];
          setCurrencies(fallbackCurrencies);

          // Set initial currency from fallback
          const initialCurrency =
            fallbackCurrencies.find((c) => c.code === currency) ||
            fallbackCurrencies[0];
          setSelectedCurrency(initialCurrency.code);
          setSelectedCurrencyInfo(initialCurrency);
        } finally {
          setIsLoading(false);
        }
      };

      loadCurrencies();
    }, [currency]);

    // Handle input change to only allow numbers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Only allow digits and decimal point
      const numericValue = inputValue.replace(/[^0-9.]/g, '');

      // Prevent multiple decimal points
      const parts = numericValue.split('.');
      const formattedValue =
        parts[0] + (parts.length > 1 ? '.' + parts[1] : '');

      // Create a synthetic event with the formatted value
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: formattedValue,
        },
      };

      // Call the parent's onChange handler
      if (onChange) {
        onChange(syntheticEvent);
      }
    };
    // Update selected currency info when currency code changes
    useEffect(() => {
      const currencyInfo =
        currencies.find((c) => c.code === selectedCurrency) || null;
      if (currencyInfo) {
        setSelectedCurrencyInfo(currencyInfo);
      }
    }, [selectedCurrency, currencies]);

    const handleCurrencyChange = (currency: CurrencyInfo) => {
      setSelectedCurrency(currency.code);
      setSelectedCurrencyInfo(currency);
      setDropdownOpen(false);

      // Mark that the user has manually selected a currency
      userSelectedCurrency.current = true;
    };

    return (
      <div className="flex flex-col pr-1 gap-[6.5px] w-full">
        {label && (
          <div className="flex items-center gap-2">
            <label className="text-gray-800 font-medium">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        )}
        <div className="flex ">
          <input
            type="text"
            inputMode="decimal"
            disabled={disabled}
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onKeyDown={onKeyDown} // Add onKeyDown handler
            ref={inputRef} // Use the ref
            className={`outline-none w-full focus:ring-1 ${inputClass} ${
              error
                ? 'focus:ring-red-500 border-red-500'
                : 'focus:ring-green-500 border-gray-200'
            } border p-4 py-[11px]  flex-1 `}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'currency-input-error' : undefined}
          />
          <div className="relative ml-[.5px]" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center py-[11px] ml-[.5px] border border-l-0 ${inputClass} ${
                error ? 'border-red-500' : 'border-gray-200'
              } px-3 bg-white cursor-pointer focus:ring-1 ${
                error ? 'focus:ring-red-500' : 'focus:ring-green-500'
              } outline-none flex gap-3 justify-between`}
              disabled={isLoading}
            >
              <div className="flex items-center text-gray-400 gap-2">
                <span>{selectedCurrencyInfo?.code || currency}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full right-0  z-10 bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto w-64">
                {isLoading ? (
                  <div className="p-3 text-center">Loading currencies...</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {currencies.map((curr) => (
                      <button
                        key={curr.id}
                        type="button"
                        onClick={() => handleCurrencyChange(curr)}
                        className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 text-left"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium">{curr.code}</div>
                          <div className="text-xs text-gray-500">
                            {curr.name}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {error && (
          <p id="currency-input-error" className="text-red-500 text-sm mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

// Add display name for better debugging
CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
