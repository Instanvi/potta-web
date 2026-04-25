import React, { useState } from 'react';
import Slider from '@potta/components/slideover';
import Input from '@potta/components/input';
import Button from '@potta/components/button';
import SearchableSelect from '@potta/components/searchableSelect';
import Checkbox from '@potta/components/checkbox';
import { MonthYearInput } from '@potta/components/customDatePicker';
import CardNumberInput from '@potta/components/CardNumberInput';
import { useCreateBankAccount } from '../hooks/useCreateBankAccount';
import { createBankAccountSchema } from '../utils/validation';
import toast from 'react-hot-toast';
import { accountsApi } from '@potta/app/(routes)/accounting/utils/api';

const accountTypeOptions = [
  { label: 'Bank Account', value: 'Bank_Account' },
  { label: 'Cash on Hand', value: 'Cash_on_Hand' },
  { label: 'Debit Card', value: 'Debit_Card' },
  { label: 'Credit Card', value: 'Credit_Card' },
];
const cardTypeOptions = [
  { label: 'Visa', value: 'Visa' },
  { label: 'MasterCard', value: 'MasterCard' },
  { label: 'Amex', value: 'Amex' },
  { label: 'Discover', value: 'Discover' },
];
const currencyOptions = [
  { label: 'US Dollar (USD)', value: 'USD' },
  { label: 'Central African CFA franc (XAF)', value: 'XAF' },
  { label: 'British Pound (GBP)', value: 'GBP' },
  { label: 'Central African CFA franc (XAF)', value: 'XAF' },
  { label: 'Nigerian Naira (NGN)', value: 'NGN' },
  { label: 'South African Rand (ZAR)', value: 'ZAR' },
  { label: 'Ghanaian Cedi (GHS)', value: 'GHS' },
  { label: 'Canadian Dollar (CAD)', value: 'CAD' },
  { label: 'Australian Dollar (AUD)', value: 'AUD' },
  { label: 'Indian Rupee (INR)', value: 'INR' },
  { label: 'Japanese Yen (JPY)', value: 'JPY' },
  { label: 'Chinese Yuan (CNY)', value: 'CNY' },
];

// Add mock ledger account options
const ledgerAccountOptions = [
  { label: 'Main Ledger 001', value: '001-002-003' },
  { label: 'Secondary Ledger 002', value: '002-003-004' },
  { label: 'Savings Ledger 003', value: '003-004-005' },
];

const AddBankAccountSlideover = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) => {
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('Bank_Account');
  const [currency, setCurrency] = useState('USD');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [sortCode, setSortCode] = useState('');
  const [iban, setIban] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardType, setCardType] = useState('Visa');
  const [expiration, setExpiration] = useState<
    { month: number; year: number } | undefined
  >(undefined);
  const [cvv, setCvv] = useState('');
  const [bankRepName, setBankRepName] = useState('');
  const [repContact, setRepContact] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [ledgerAccountId, setLedgerAccountId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ledgerAccounts, setLedgerAccounts] = useState<any[]>([]);
  const [loadingLedgerAccounts, setLoadingLedgerAccounts] = useState(false);

  const cardTypeIcons: Record<string, string> = {
    Visa: 'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/visa.svg',
    MasterCard:
      'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/mastercard.svg',
    Amex: 'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/amex.svg',
    Discover:
      'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons/flat/discover.svg',
  };

  const createBankAccount = useCreateBankAccount();

  // Dynamic search for ledger accounts
  const handleLedgerAccountSearch = (inputValue: string) => {
    setLoadingLedgerAccounts(true);
    accountsApi
      .getFiltered({
        search: inputValue,
        filter: ['code'],
        limit: 10,
      })
      .then((response) => {
        const searchResults = response.data || [];
        // Merge search results with existing ledgerAccounts, avoiding duplicates
        setLedgerAccounts((prev) => {
          const all = [...prev];
          searchResults.forEach((acc: any) => {
            if (!all.some((a) => a.uuid === acc.uuid)) {
              all.push(acc);
            }
          });
          return all;
        });
      })
      .catch(() => setLedgerAccounts([]))
      .finally(() => setLoadingLedgerAccounts(false));
    return inputValue;
  };

  const handleLedgerAccountChange = (uuid: string) => {
    setLedgerAccountId(uuid);
    // No need to fetch individually, since the account is already in ledgerAccounts
  };

  const ledgerAccountOptions = ledgerAccounts.map((account: any) => ({
    label: `${account.code || ''} - ${account.name}`,
    value: account.uuid,
  }));

  // Helper to determine which fields to show
  const isBankAccount = accountType === 'Bank_Account';
  const isCashOnHand = accountType === 'Cash_on_Hand';
  const isCard = accountType === 'Debit_Card' || accountType === 'Credit_Card';

  function getExpirationDateString(
    expiration: { month: number; year: number } | undefined
  ) {
    if (!expiration) return '';
    // Format as MM/YYYY for backend
    return `${expiration.month.toString().padStart(2, '0')}/${expiration.year
      .toString()
      .slice(-2)}`;
  }

  // Handle form submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('Save button clicked');
    let payload = {
      account_name: accountName,
      account_type: accountType,
      currency,
      bank_name: isBankAccount ? bankName : undefined,
      account_number: isBankAccount ? accountNumber : undefined,
      sort_code: isBankAccount ? sortCode : undefined,
      iban: isBankAccount ? iban : undefined,
      card_number: isCard ? cardNumber : undefined,
      card_type: isCard ? cardType : undefined,
      expiration_date: isCard ? getExpirationDateString(expiration) : undefined,
      cvv: isCard ? cvv : undefined,
      bank_representative_name: isCard ? bankRepName : undefined,
      representative_contact: isCard ? repContact : undefined,
      is_active: isActive,
      ledger_account_id: ledgerAccountId, // Always include this
    };
    payload = Object.fromEntries(
      Object.entries(payload).filter(([_, v]) => v !== undefined)
    );
    console.log('Payload to validate:', payload);
    console.log('Ledger Account ID at submit:', ledgerAccountId);
    try {
      await createBankAccountSchema.validate(payload, { abortEarly: false });
      console.log('Validation passed');
      setErrors({});
      await createBankAccount.mutateAsync(payload as any);
      console.log('API call successful, closing slideover');
      toast.success('Bank account created successfully!');
      // Clear all input states
      setAccountName('');
      setAccountType('Bank_Account');
      setCurrency('USD');
      setBankName('');
      setAccountNumber('');
      setSortCode('');
      setIban('');
      setCardNumber('');
      setCardType('Visa');
      setExpiration(undefined);
      setCvv('');
      setBankRepName('');
      setRepContact('');
      setIsActive(true);
      setLedgerAccountId('');
      setLedgerAccounts([]);
      setErrors({});
      setOpen(false);
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        const fieldErrors: Record<string, string> = {};
        err.inner.forEach((e: any) => {
          if (e.path) fieldErrors[e.path] = e.message;
        });
        setErrors(fieldErrors);
        console.log('Validation errors:', fieldErrors);
      } else {
        toast.error('Failed to create bank account.');
        console.log('API call failed:', err);
      }
    }
  }

  return (
    <Slider
      edit={false}
      title="Add Bank Account"
      open={open}
      setOpen={setOpen}
      noPanelScroll={true}
    >
      <div className="w-full max-w-5xl mx-auto">
        {/* Custom Tabs for Account Type (like budgets page) */}
        <div className="w-[60%] flex mb-6">
          {accountTypeOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => setAccountType(option.value)}
              className={`w-full h-12 flex justify-center cursor-pointer items-center bg-[#F3FBFB] ${
                accountType === option.value &&
                'border-b-2 border-[#154406] text-[#154406] font-medium'
              }`}
            >
              <p>{option.label}</p>
            </div>
          ))}
        </div>
        <form className=" flex flex-row gap-8">
          {/* Left Side */}
          <div className="flex-1 flex flex-col gap-4">
            {isBankAccount && (
              <>
                <div className="flex flex-col gap-4">
                  <Input
                    label="Account Name"
                    name="account_name"
                    type="text"
                    value={accountName}
                    onchange={(e) => setAccountName(e.target.value)}
                    required
                    placeholder="e.g. Main Business Account"
                    errors={
                      errors.account_name
                        ? { message: errors.account_name }
                        : undefined
                    }
                  />
                  <SearchableSelect
                    label="Currency"
                    name="currency"
                    options={currencyOptions}
                    selectedValue={currency}
                    onChange={setCurrency}
                    required
                    placeholder="Select currency"
                    error={errors.currency}
                  />
                  <Input
                    label="Bank Name"
                    name="bank_name"
                    type="text"
                    value={bankName}
                    onchange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Chase Bank"
                    errors={
                      errors.bank_name
                        ? { message: errors.bank_name }
                        : undefined
                    }
                  />
                  <Input
                    label="Account Number"
                    name="account_number"
                    type="text"
                    value={accountNumber}
                    onchange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 1234567890"
                    errors={
                      errors.account_number
                        ? { message: errors.account_number }
                        : undefined
                    }
                  />
                </div>
              </>
            )}
            {isCashOnHand && (
              <>
                <Input
                  label="Account Name"
                  name="account_name"
                  type="text"
                  value={accountName}
                  onchange={(e) => setAccountName(e.target.value)}
                  required
                  placeholder="e.g. Main Business Account"
                  errors={
                    errors.account_name
                      ? { message: errors.account_name }
                      : undefined
                  }
                />
                <SearchableSelect
                  label="Currency"
                  name="currency"
                  options={currencyOptions}
                  selectedValue={currency}
                  onChange={setCurrency}
                  required
                  placeholder="Select currency"
                  error={errors.currency}
                />

                <div className="flex items-center gap-4 mt-2">
                  <Checkbox
                    id="active-checkbox"
                    label="Active"
                    checked={isActive}
                    onChange={setIsActive}
                  />
                </div>
              </>
            )}
            {isCard && (
              <>
                <Input
                  label="Account Name"
                  name="account_name"
                  type="text"
                  value={accountName}
                  onchange={(e) => setAccountName(e.target.value)}
                  required
                  placeholder="e.g. Main Business Account"
                  errors={
                    errors.account_name
                      ? { message: errors.account_name }
                      : undefined
                  }
                />
                <SearchableSelect
                  label="Currency"
                  name="currency"
                  options={currencyOptions}
                  selectedValue={currency}
                  onChange={setCurrency}
                  required
                  placeholder="Select currency"
                  error={errors.currency}
                />
                <SearchableSelect
                  label="Ledger Account ID"
                  name="ledger_account_id"
                  options={ledgerAccountOptions}
                  onInputChange={handleLedgerAccountSearch}
                  isLoading={loadingLedgerAccounts}
                  selectedValue={ledgerAccountId}
                  onChange={handleLedgerAccountChange}
                  required
                  placeholder="e.g. 001-002-003"
                  error={errors.ledger_account_id}
                />
                <Input
                  label="Bank Representative Name"
                  name="bank_representative_name"
                  type="text"
                  value={bankRepName}
                  onchange={(e) => setBankRepName(e.target.value)}
                  placeholder="e.g. John Doe"
                  errors={
                    errors.bank_representative_name
                      ? { message: errors.bank_representative_name }
                      : undefined
                  }
                />
                <Input
                  label="Representative Contact"
                  name="representative_contact"
                  type="text"
                  value={repContact}
                  onchange={(e) => setRepContact(e.target.value)}
                  placeholder="e.g. +1234567890"
                  errors={
                    errors.representative_contact
                      ? { message: errors.representative_contact }
                      : undefined
                  }
                />
                <div className="flex items-center gap-4 mt-2">
                  <Checkbox
                    id="active-checkbox"
                    label="Active"
                    checked={isActive}
                    onChange={setIsActive}
                  />
                </div>
              </>
            )}
          </div>
          {/* Right Side */}
          <div className="flex-1 flex flex-col gap-4">
            {isBankAccount && (
              <>
                <Input
                  label="Sort Code"
                  name="sort_code"
                  type="text"
                  value={sortCode}
                  onchange={(e) => setSortCode(e.target.value)}
                  placeholder="e.g. 12-34-56"
                  errors={
                    errors.sort_code ? { message: errors.sort_code } : undefined
                  }
                />
                <Input
                  label="IBAN"
                  name="iban"
                  type="text"
                  value={iban}
                  onchange={(e) => setIban(e.target.value)}
                  placeholder="e.g. GB29NWBK60161331926819"
                  errors={errors.iban ? { message: errors.iban } : undefined}
                />
                <SearchableSelect
                  label="Ledger Account ID"
                  name="ledger_account_id"
                  options={ledgerAccountOptions}
                  onInputChange={handleLedgerAccountSearch}
                  isLoading={loadingLedgerAccounts}
                  selectedValue={ledgerAccountId}
                  onChange={handleLedgerAccountChange}
                  required
                  placeholder="e.g. 001-002-003"
                  error={errors.ledger_account_id}
                />
              </>
            )}
            {isCashOnHand && (
              <SearchableSelect
                label="Ledger Account ID"
                name="ledger_account_id"
                options={ledgerAccountOptions}
                onInputChange={handleLedgerAccountSearch}
                isLoading={loadingLedgerAccounts}
                selectedValue={ledgerAccountId}
                onChange={handleLedgerAccountChange}
                required
                placeholder="e.g. 001-002-003"
                error={errors.ledger_account_id}
              />
            )}
            {isCard && (
              <>
                {/* Card Visual Preview */}
                <div className="relative bg-gradient-to-tr from-blue-600 to-green-400 rounded-md shadow-lg p-6 mb-4 min-h-[180px] flex flex-col justify-between text-white">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium tracking-widest">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </span>
                    <span className="text-sm font-medium flex items-center gap-2">
                      {cardType && (
                        <img
                          src={cardTypeIcons[cardType] || cardTypeIcons['Visa']}
                          alt={cardType}
                          className="inline-block h-6 w-auto"
                        />
                      )}
                      <span>{cardType || 'Visa'}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-end mt-6">
                    <div>
                      <div className="text-xs uppercase">Cardholder</div>
                      <div className="text-base font-medium">
                        {bankRepName || 'Cardholder Name'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase">Expires</div>
                      <div className="text-base font-medium">
                        {expiration
                          ? `${expiration.month
                              .toString()
                              .padStart(2, '0')}/${expiration.year
                              .toString()
                              .slice(-2)}`
                          : 'MM/YY'}
                      </div>
                    </div>
                  </div>
                </div>
                <CardNumberInput
                  label="Card Number"
                  name="card_number"
                  value={cardNumber}
                  onChange={setCardNumber}
                  placeholder="e.g. 1234 5678 9012 3456"
                  required={isCard}
                />
                {errors.card_number && (
                  <small className="text-red-500">{errors.card_number}</small>
                )}
                <SearchableSelect
                  label="Card Type"
                  name="card_type"
                  options={cardTypeOptions}
                  selectedValue={cardType}
                  onChange={setCardType}
                  placeholder="Select card type"
                  error={errors.card_type}
                />
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <MonthYearInput
                      label="Expiration Date"
                      value={expiration}
                      onChange={setExpiration}
                      placeholder="MM/YY"
                    />
                    {errors.expiration_date && (
                      <small className="text-red-500">
                        {errors.expiration_date}
                      </small>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      label="CVV"
                      name="cvv"
                      type="text"
                      value={cvv}
                      onchange={(e) => setCvv(e.target.value)}
                      placeholder="e.g. 123"
                      errors={errors.cvv ? { message: errors.cvv } : undefined}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </form>
        <div className="fixed bottom-0 left-0 right-0 p-2 bg-white border-t border-gray-200 flex justify-end space-x-3">
          <Button
            text={createBankAccount.isPending ? 'Saving...' : 'Save Account'}
            type="button"
            onClick={handleSubmit}
            disabled={createBankAccount.isPending}
            className="!py-3 !px-6"
          />
        </div>
      </div>
    </Slider>
  );
};

export default AddBankAccountSlideover;
