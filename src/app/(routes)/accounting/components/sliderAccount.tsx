'use client';
import React, { useState, useEffect } from 'react';
import Input from '@potta/components/input';
import Slider from '@potta/components/slideover';
import SearchableSelect from '@potta/components/searchableSelect';
import Button from '@potta/components/button';
import { accountsApi } from '../utils/api';
import { ACCOUNT_TYPES, type AccountType, type accountPayload } from '../utils/validations';

interface AccountNode {
  uuid: string;
  name: string;
  code: string;
  type: string;
  initialBalance: number;
  currentBalance: number;
  children: AccountNode[];
  isActive: boolean;
  branchId?: string;
  createdAt?: string;
  updatedAt?: string;
  organizationId?: string;
  path?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedAt?: string | null;
}

interface SliderAccountProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  account: AccountNode | null; // This is the parent account when creating a child
  onAccountSaved?: () => void;
}

const accountTypeOptions = ACCOUNT_TYPES.map((value) => ({
  value,
  label: value.charAt(0) + value.slice(1).toLowerCase(),
}));

const toAccountType = (value: string): AccountType => {
  const upper = value.toUpperCase() as AccountType;
  return ACCOUNT_TYPES.includes(upper) ? upper : 'ASSET';
};

const errorMessage = (err: unknown): string => {
  const data = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data;
  const message = Array.isArray(data?.message) ? data?.message.join(', ') : data?.message;
  if (message) return message;
  return err instanceof Error ? err.message : 'Failed to save account';
};

const SliderAccount: React.FC<SliderAccountProps> = ({
  open,
  setOpen,
  account,
  onAccountSaved,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountsByType, setAccountsByType] = useState<AccountNode[]>([]);
  const [parentAccount, setParentAccount] = useState<string | null>(null);
  const [accountName, setAccountName] = useState('');
  const [initialBalance, setInitialBalance] = useState(0);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const [accountType, setAccountType] = useState<AccountType>('ASSET');

  // Helper function to flatten the account hierarchy for parent selection
  const flattenAccountHierarchy = (accounts: AccountNode[]): AccountNode[] => {
    let result: AccountNode[] = [];

    accounts.forEach((account) => {
      result.push(account);
      if (account.children && account.children.length > 0) {
        result = [...result, ...flattenAccountHierarchy(account.children)];
      }
    });

    return result;
  };

  // Reset hierarchy when account type changes
  const handleAccountTypeChange = (value: string) => {
    setAccountType(toAccountType(value));
    setParentAccount(null);
  };

  // Fetch accounts filtered by account type for parent selection
  useEffect(() => {
    const fetchAccountsByType = async () => {
      if (!open) return;

      try {
        setLoadingAccounts(true);
        const response = await accountsApi.getByType(accountType, '');
        setAccountsByType(response.data || []);
      } catch {
        setError('Failed to load accounts. Please try again.');
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchAccountsByType();
  }, [accountType, open]);

  // Reset form when opening/closing
  useEffect(() => {
    if (open) {
      if (account) {
        // Creating child account mode - set parent automatically
        setAccountName('');
        setAccountType(toAccountType(account.type));
        setInitialBalance(0);
        setParentAccount(account.uuid); // Set the parent ID directly
      } else {
        // Create mode - fresh account
        setAccountName('');
        setAccountType('ASSET');
        setInitialBalance(0);
        setParentAccount(null);
      }
      setError(null);
    }
  }, [open, account]);

  // Form validation
  const validateForm = (): string | null => {
    if (!accountName.trim()) {
      return 'Account name is required';
    }
    return null;
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }

      // The org comes from the request headers and the backend generates the code.
      const accountData: accountPayload = {
        name: accountName.trim(),
        type: accountType,
        initialBalance,
        ...(parentAccount ? { parentId: parentAccount } : {}),
      };

      await accountsApi.create(accountData);

      setOpen(false);
      if (onAccountSaved) {
        onAccountSaved();
      }
    } catch (err: unknown) {
      setError(errorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Generate parent account options for selection
  const generateParentOptions = () => {
    const flattenedAccounts = flattenAccountHierarchy(accountsByType);

    return flattenedAccounts.map((acc) => ({
      value: acc.uuid,
      label: `${acc.code} - ${acc.name}${acc.path ? ` (${acc.path})` : ''}`,
    }));
  };

  return (
    <Slider
      open={open}
      setOpen={setOpen}
      edit={false}
      title={
        account
          ? `Create Child Account under ${account.name}`
          : 'Create Account'
      }
      buttonText="account"
    >
      <div className="my-14 min-w-[600px] relative">
        {error && (
          <div className="mb-4 rounded-[2px] border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <div className="mb-4">
          {/* Account Type */}
          <div className="mb-4">
            <SearchableSelect
              label="Account Type"
              options={accountTypeOptions}
              selectedValue={accountType}
              onChange={handleAccountTypeChange}
              placeholder="Select account type..."
              required
              isDisabled={account !== null}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {account
                ? 'Account type is inherited from parent'
                : 'Select the account type'}
            </p>
          </div>

          {/* Show parent account info when creating child */}
          {account && (
            <div className="mb-4 rounded-[2px] border border-primary/20 bg-brand-subtle p-3">
              <p className="text-xs font-medium text-primary mb-1">
                Creating child account under:
              </p>
              <div className="text-xs text-primary">
                <span className="font-medium">
                  {account.code} - {account.name}
                </span>
                <br />
                <span className="text-primary">Type: {account.type}</span>
              </div>
            </div>
          )}

          {/* Parent Account Selection - only show if not creating child */}
          {!account && (
            <div className="mb-4">
              <SearchableSelect
                label="Parent Account (Optional)"
                options={[
                  { value: '', label: 'Create as Top Level Account' },
                  ...generateParentOptions(),
                ]}
                selectedValue={parentAccount || ''}
                onChange={(value: string) => setParentAccount(value || null)}
                placeholder="Select parent account..."
                isDisabled={loadingAccounts}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {loadingAccounts
                  ? 'Loading accounts...'
                  : 'Leave empty to create a top-level account. Account code will be auto-generated.'}
              </p>
            </div>
          )}

          {/* Account Name */}
          <div className="mb-4">
            <Input
              label="Account Name"
              name="name"
              placeholder="Enter Account Name"
              type="text"
              value={accountName}
              onchange={(e) => setAccountName(e.target.value)}
              required
            />
          </div>

          {/* Initial Balance */}
          <div className="mb-4">
            <Input
              label="Initial Balance"
              name="initialBalance"
              placeholder="Enter Initial Balance"
              type="number"
              value={initialBalance.toString()}
              onchange={(e) =>
                setInitialBalance(parseFloat(e.target.value) || 0)
              }
            />
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-2 bg-white border-t border-black/10 flex justify-end space-x-3">
          <Button
            type="submit"
            text={isLoading ? 'Creating Account...' : 'Create Account'}
            onClick={handleSubmit}
            disabled={isLoading}
          />
        </div>
      </div>
    </Slider>
  );
};

export default SliderAccount;
