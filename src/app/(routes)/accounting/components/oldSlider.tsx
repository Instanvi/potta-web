'use client';
import React, { useState, useEffect } from 'react';
import Input from '@potta/components/input';
import Slider from '@potta/components/slideover';
import SearchableSelect from '@potta/components/searchableSelect';
import Button from '@potta/components/button';
import { accountsApi } from '../utils/api';

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
  account: AccountNode | null;
  onAccountSaved?: () => void;
}

const SliderAccount: React.FC<SliderAccountProps> = ({
  open,
  setOpen,
  account,
  onAccountSaved,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountsByType, setAccountsByType] = useState<AccountNode[]>([]);
  const [flattenedAccounts, setFlattenedAccounts] = useState<AccountNode[]>([]);
  const [parentAccount, setParentAccount] = useState<string | null>(null);
  const [accountName, setAccountName] = useState('');
  const [accountCode, setAccountCode] = useState('');
  const [initialBalance, setInitialBalance] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [codeGenerationInfo, setCodeGenerationInfo] = useState<string>('');

  // Dynamic hierarchy state - can handle unlimited levels
  const [selectedLevels, setSelectedLevels] = useState<{
    [level: number]: string;
  }>({});
  const [maxAvailableLevel, setMaxAvailableLevel] = useState<number>(0);

  // Account type options
  const accountTypeOptions = [
    { value: 'Asset', label: 'Asset' },
    { value: 'Liability', label: 'Liability' },
    { value: 'Equity', label: 'Equity' },
    { value: 'Revenue', label: 'Revenue' },
    { value: 'Expense', label: 'Expense' },
  ];

  // State for account type
  const [accountType, setAccountType] = useState(accountTypeOptions[0].value);

  // Helper function to flatten the account hierarchy
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

  // Get account level from path
  const getAccountLevel = (account: AccountNode): number => {
    if (!account.path) return 1;
    return account.path.split('/').length;
  };

  // Calculate the maximum available level in the current data
  const calculateMaxLevel = (accounts: AccountNode[]): number => {
    let maxLevel = 0;
    const flattened = flattenAccountHierarchy(accounts);

    flattened.forEach((account) => {
      const level = getAccountLevel(account);
      if (level > maxLevel) {
        maxLevel = level;
      }
    });

    return maxLevel;
  };

  // Get accounts by hierarchy level dynamically
  const getAccountsByLevel = (
    level: number,
    parentId?: string
  ): AccountNode[] => {
    if (level === 1) {
      // Return top-level accounts
      return accountsByType.filter(
        (acc) => !acc.path || acc.path.split('/').length === 1
      );
    }

    if (!parentId) return [];

    // Find the parent account in flattened list
    const parent = flattenedAccounts.find((acc) => acc.uuid === parentId);
    if (!parent) return [];

    // Return direct children of the parent
    return parent.children || [];
  };

  // Enhanced code generation function with better duplicate checking
  const generateNextCode = (
    parent: AccountNode | null,
    allAccounts: AccountNode[],
    accountType: string
  ): string => {
    let generatedCode = '';
    let info = '';

    if (parent) {
      const parentCode = parent.code;
      const directChildren = parent.children || [];

      if (directChildren.length === 0) {
        // First child - use intelligent pattern detection
        const parentLevel = getAccountLevel(parent);
        let suffix = '';

        // Analyze existing patterns in the data to determine suffix
        if (parentLevel === 1) {
          // For class level (1, 2, 3, etc.), children typically start with 01
          suffix = '01';
        } else {
          // For other levels, start with 1
          suffix = '1';
        }

        generatedCode = `${parentCode}${suffix}`;
        info = `First child of ${parentCode}, starting with ${suffix}`;
      } else {
        // Find the pattern and next available number
        const childCodes = directChildren.map((child) => child.code);

        // Extract numeric suffixes from existing child codes
        const suffixes = childCodes
          .map((code) => {
            const suffix = code.substring(parentCode.length);
            return parseInt(suffix, 10);
          })
          .filter((num) => !isNaN(num))
          .sort((a, b) => a - b);

        // Find the next available number
        let nextNumber = 1;
        if (suffixes.length > 0) {
          // Check for gaps in the sequence
          for (let i = 0; i < suffixes.length; i++) {
            if (suffixes[i] !== i + 1) {
              nextNumber = i + 1;
              break;
            }
          }
          // If no gaps, use the next number after the last one
          if (nextNumber === 1) {
            nextNumber = suffixes[suffixes.length - 1] + 1;
          }
        }

        // Determine padding based on existing pattern or parent level
        let digitPattern = 1;
        if (childCodes.length > 0) {
          // Use the pattern from existing children
          digitPattern = childCodes[0].substring(parentCode.length).length;
        } else {
          // Default padding based on parent level
          const parentLevel = getAccountLevel(parent);
          digitPattern = parentLevel === 1 ? 2 : 1; // Class level uses 2 digits, others use 1
        }

        // Ensure we don't create a duplicate
        let attempts = 0;
        const maxAttempts = 1000; // Prevent infinite loop

        while (attempts < maxAttempts) {
          const candidateCode = `${parentCode}${nextNumber
            .toString()
            .padStart(digitPattern, '0')}`;

          // Check if this code already exists in the flattened accounts
          const codeExists = allAccounts.some(
            (acc) => acc.code === candidateCode
          );

          if (!codeExists) {
            generatedCode = candidateCode;
            info = `Next available: ${nextNumber} (Pattern: ${digitPattern} digits, checked ${
              attempts + 1
            } codes)`;
            break;
          }

          nextNumber++;
          attempts++;
        }

        if (attempts >= maxAttempts) {
          // Fallback: use timestamp suffix
          const timestamp = Date.now().toString().slice(-4);
          generatedCode = `${parentCode}${timestamp}`;
          info = `Fallback code using timestamp (too many existing codes)`;
        }
      }
    } else {
      // Generate code for top-level account
      const topLevelAccounts = accountsByType.filter(
        (acc) => !acc.path || acc.path.split('/').length === 1
      );

      const defaultStartCodes: { [key: string]: number } = {
        Equity: 1,
        Asset: 2,
        Liability: 4,
        Expense: 6,
        Revenue: 7,
      };

      if (topLevelAccounts.length === 0) {
        const startCode = defaultStartCodes[accountType] || 1;
        generatedCode = startCode.toString();
        info = `First ${accountType} account, using class code: ${startCode}`;
      } else {
        const numericCodes = topLevelAccounts
          .map((acc) => parseInt(acc.code, 10))
          .filter((num) => !isNaN(num))
          .sort((a, b) => a - b);

        let nextNumber = defaultStartCodes[accountType] || 1;

        // Find next available number, checking against all flattened accounts
        let attempts = 0;
        const maxAttempts = 1000;

        while (attempts < maxAttempts) {
          const candidateCode = nextNumber.toString();
          const codeExists = allAccounts.some(
            (acc) => acc.code === candidateCode
          );

          if (!codeExists) {
            generatedCode = candidateCode;
            info = `Next available class: ${nextNumber} (checked ${
              attempts + 1
            } codes)`;
            break;
          }

          nextNumber++;
          attempts++;
        }

        if (attempts >= maxAttempts) {
          // Fallback
          const timestamp = Date.now().toString().slice(-3);
          generatedCode = `${defaultStartCodes[accountType] || 1}${timestamp}`;
          info = `Fallback code using timestamp`;
        }
      }
    }

    setCodeGenerationInfo(info);
    return generatedCode;
  };

  // Update parent account when hierarchy levels change
  useEffect(() => {
    // Find the deepest selected level
    let finalParent = null;
    const levels = Object.keys(selectedLevels)
      .map(Number)
      .sort((a, b) => b - a); // Sort descending to get highest level first

    for (const level of levels) {
      if (selectedLevels[level]) {
        finalParent = selectedLevels[level];
        break;
      }
    }

    setParentAccount(finalParent);
  }, [selectedLevels]);

  // Auto-generate code when parent changes
  useEffect(() => {
    if (!isEditMode && flattenedAccounts.length > 0) {
      const parent = parentAccount
        ? flattenedAccounts.find((acc) => acc.uuid === parentAccount)
        : null;
      const nextCode: any = generateNextCode(parent || null, flattenedAccounts, accountType);
      setAccountCode(nextCode);
    }
  }, [parentAccount, flattenedAccounts, isEditMode, accountType]);

  // Force regenerate code when opening with a parent account
  useEffect(() => {
    if (open && account && flattenedAccounts.length > 0) {
      // Force regenerate code for child account creation
      const nextCode = generateNextCode(
        account,
        flattenedAccounts,
        account.type
      );
      setAccountCode(nextCode);
    }
  }, [open, account, flattenedAccounts]);

  // Reset hierarchy when account type changes
  const handleAccountTypeChange = (value: string) => {
    setAccountType(value);
    setSelectedLevels({});
    setParentAccount(null);
    setAccountCode('');
    setCodeGenerationInfo('');
  };

  // Handle level selection with cascading reset
  const handleLevelChange = (level: number, value: string) => {
    const newSelectedLevels = { ...selectedLevels };

    // Set the current level
    if (value) {
      newSelectedLevels[level] = value;
    } else {
      delete newSelectedLevels[level];
    }

    // Clear all levels deeper than the current one
    Object.keys(newSelectedLevels).forEach((levelKey) => {
      const levelNum = Number(levelKey);
      if (levelNum > level) {
        delete newSelectedLevels[levelNum];
      }
    });

    setSelectedLevels(newSelectedLevels);
  };

  // Fetch accounts filtered by account type
  useEffect(() => {
    const fetchAccountsByType = async () => {
      if (!open) return;

      try {
        setLoadingAccounts(true);
        const response = await accountsApi.getByType(accountType, '');
        const data = response.data || [];
        setAccountsByType(data);
        const flattened = flattenAccountHierarchy(data);
        setFlattenedAccounts(flattened);

        // Calculate maximum available level
        const maxLevel = calculateMaxLevel(data);
        setMaxAvailableLevel(maxLevel);

        console.log('Fetched accounts by type:', {
          type: accountType,
          totalAccounts: data.length,
          rootAccounts: data.filter(
            (acc) => !acc.path || acc.path.split('/').length === 1
          ).length,
        });
      } catch (error) {
        console.error('Error fetching accounts by type:', error);
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
        // Creating child account mode
        setIsEditMode(false);
        setAccountName('');
        setAccountCode('');
        setAccountType(account.type);
        setInitialBalance(0);

        // Set the hierarchy based on the passed account
        const newSelectedLevels: { [level: number]: string } = {};

        if (account.path) {
          const pathParts = account.path.split('/');
          pathParts.forEach((part, index) => {
            const levelAccount = flattenedAccounts.find(
              (acc) => acc.path === pathParts.slice(0, index + 1).join('/')
            );
            if (levelAccount) {
              newSelectedLevels[index + 1] = levelAccount.uuid;
            }
          });
        } else {
          newSelectedLevels[1] = account.uuid;
        }

        setSelectedLevels(newSelectedLevels);
        setCodeGenerationInfo('');
      } else {
        // Create mode - fresh account
        setIsEditMode(false);
        setAccountName('');
        setAccountCode('');
        setAccountType(accountTypeOptions[0].value);
        setInitialBalance(0);
        setSelectedLevels({});
        setParentAccount(null);
        setCodeGenerationInfo('');
      }
      setError(null);
    }
  }, [open, account, flattenedAccounts]);

  // Enhanced form validation
  const validateForm = (): string | null => {
    if (!accountName.trim()) {
      return 'Account name is required';
    }

    if (!accountCode.trim()) {
      return 'Account code is required';
    }

    // Check against all flattened accounts
    const codeExists = flattenedAccounts.some(
      (acc) =>
        acc.code === accountCode && (!isEditMode || acc.uuid !== account?.uuid)
    );

    if (codeExists) {
      return `Account code "${accountCode}" already exists. Please use a different code.`;
    }

    // Additional check: if creating a child, ensure the code starts with parent code
    if (parentAccount) {
      const parent = flattenedAccounts.find(
        (acc) => acc.uuid === parentAccount
      );
      if (parent && !accountCode.startsWith(parent.code)) {
        return `Child account code must start with parent code "${parent.code}"`;
      }
    }

    return null;
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }

      const accountData = {
        name: accountName,
        code: accountCode,
        type: accountType,
        initialBalance: initialBalance,
        parentId: parentAccount || undefined,
      };

      if (isEditMode && account) {
        await accountsApi.update(account.uuid, accountData);
      } else {
        await accountsApi.create(accountData);
      }

      setOpen(false);
      if (onAccountSaved) {
        onAccountSaved();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save account');
      console.error('Error saving account:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate level labels dynamically
  const getLevelLabel = (level: number): string => {
    const labels = [
      '', // 0 index (not used)
      'Class Level',
      'Main Category',
      'Sub Category',
      'Detail Level',
      'Sub Detail',
      'Level 6',
      'Level 7',
      'Level 8',
      'Level 9',
      'Level 10',
    ];

    return labels[level] || `Level ${level}`;
  };

  // Generate options for each level dynamically
  const generateLevelOptions = (level: number) => {
    const parentId = level === 1 ? undefined : selectedLevels[level - 1];
    const accounts = getAccountsByLevel(level, parentId);

    return accounts.map((acc) => ({
      value: acc.uuid,
      label: `${acc.code} - ${acc.name}`,
    }));
  };

  // Get selected account info for display
  const getSelectedAccountInfo = () => {
    const selectedAccount = parentAccount
      ? flattenedAccounts.find((acc) => acc.uuid === parentAccount)
      : null;

    if (!selectedAccount) return null;

    const level = getAccountLevel(selectedAccount);
    return {
      account: selectedAccount,
      level: level,
      nextLevel: level + 1,
    };
  };

  const selectedAccountInfo = getSelectedAccountInfo();

  // Render hierarchy selectors dynamically
  const renderHierarchySelectors = () => {
    const selectors = [];

    // Always show level 1
    const level1Options = generateLevelOptions(1);
    selectors.push(
      <div key={1} className="mb-3">
        <SearchableSelect
          label={`${getLevelLabel(1)} (${level1Options.length} available)`}
          options={[
            { value: '', label: 'Create as Top Level Account' },
            ...level1Options,
          ]}
          selectedValue={selectedLevels[1] || ''}
          onChange={(value: string) => handleLevelChange(1, value)}
          placeholder={`Select ${getLevelLabel(1).toLowerCase()}...`}
          disabled={loadingAccounts || account !== null}
        />
      </div>
    );

    // Show subsequent levels based on selections and available data
    for (let level = 2; level <= maxAvailableLevel + 1; level++) {
      const parentSelected = selectedLevels[level - 1];
      const options = generateLevelOptions(level);

      // Only show if parent is selected and there are options OR if we want to create at this level
      if (
        parentSelected &&
        (options.length > 0 || level <= maxAvailableLevel + 1)
      ) {
        selectors.push(
          <div key={level} className="mb-3">
            <SearchableSelect
              label={`${getLevelLabel(level)} (${options.length} available)`}
              options={[
                {
                  value: '',
                  label: `Create under ${getLevelLabel(level - 1)}`,
                },
                ...options,
              ]}
              selectedValue={selectedLevels[level] || ''}
              onChange={(value: string) => handleLevelChange(level, value)}
              placeholder={`Select ${getLevelLabel(level).toLowerCase()}...`}
              disabled={loadingAccounts}
            />
          </div>
        );
      }
    }

    return selectors;
  };

  return (
    <Slider
      open={open}
      setOpen={setOpen}
      edit={isEditMode}
      title={
        account
          ? `Create Child Account under ${account.name}`
          : 'Create Account'
      }
      buttonText="account"
    >
      <div className="my-14 min-w-[600px] relative">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Account Structure</h3>

          {/* Account Type */}
          <div className="mb-4">
            <SearchableSelect
              label="Account Type"
              options={accountTypeOptions}
              selectedValue={accountType}
              onChange={handleAccountTypeChange}
              placeholder="Select account type..."
              required
              disabled={account !== null}
            />
            <p className="text-xs text-gray-500 mt-1">
              {account
                ? 'Account type is inherited from parent'
                : 'Select the account type to filter available parent accounts'}
            </p>
          </div>

          {/* Show parent account info when creating child */}
          {account && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-xs font-medium text-blue-800 mb-1">
                Creating child account under:
              </p>
              <div className="text-xs text-blue-700">
                <span className="font-medium">
                  {account.code} - {account.name}
                </span>
                <br />
                <span className="text-blue-600">Type: {account.type}</span>
                {account.path && (
                  <>
                    <br />
                    <span className="text-blue-500 text-xs">
                      Path: {account.path}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Dynamic Hierarchical Parent Selection - only show if not creating child */}
          {!account && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-3">
                Select Parent Account (Hierarchical) - {maxAvailableLevel}{' '}
                levels available
              </h4>

              {loadingAccounts && (
                <div className="text-blue-500 text-xs mb-2">
                  Loading accounts...
                </div>
              )}

              {/* Debug info */}
              {!loadingAccounts && accountsByType.length > 0 && (
                <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
                  <p>
                    Total {accountType} accounts loaded: {accountsByType.length}
                  </p>
                  <p>
                    Root accounts of this type: {getAccountsByLevel(1).length}
                  </p>
                </div>
              )}

              {/* Render dynamic hierarchy selectors */}
              {renderHierarchySelectors()}

              {/* Selected Parent Info */}
              {selectedAccountInfo && (
                <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                  <p className="text-xs font-medium text-blue-800 mb-1">
                    Selected Parent (Level {selectedAccountInfo.level}):
                  </p>
                  <div className="text-xs text-blue-700">
                    <span className="font-medium">
                      {selectedAccountInfo.account.code} -{' '}
                      {selectedAccountInfo.account.name}
                    </span>
                    <br />
                    <span className="text-blue-600">
                      New account will be created at Level{' '}
                      {selectedAccountInfo.nextLevel}
                    </span>
                    {selectedAccountInfo.account.path && (
                      <>
                        <br />
                        <span className="text-blue-500 text-xs">
                          Path: {selectedAccountInfo.account.path}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {!parentAccount && (
                <div className="mt-3 p-2 bg-gray-50 rounded-md text-xs text-gray-600">
                  <span className="font-medium">Top-level account</span> - No
                  parent selected
                </div>
              )}
            </div>
          )}

          {/* Account Code */}
          <div className="mb-4">
            <Input
              label="Account Code"
              name="code"
              placeholder="Enter Account Code"
              type="text"
              value={accountCode}
              onchange={(e) => setAccountCode(e.target.value)}
              disabled={isEditMode}
            />
            <p className="text-xs text-gray-500 mt-1">
              {isEditMode
                ? 'Account code cannot be changed after creation'
                : 'The code is automatically generated based on the parent account and account type'}
            </p>
            {codeGenerationInfo && !isEditMode && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                <p className="font-medium text-blue-700">
                  Code Generation Info:
                </p>
                <p className="text-blue-600 mt-1">{codeGenerationInfo}</p>
              </div>
            )}
          </div>

          {/* Account Name */}
          <Input
            label="Account Name"
            name="name"
            placeholder="Enter Account Name"
            type="text"
            value={accountName}
            onchange={(e) => setAccountName(e.target.value)}
            required
          />

          {/* Initial Balance */}
          <Input
            label="Initial Balance"
            name="initialBalance"
            placeholder="Enter Initial Balance"
            type="number"
            value={initialBalance.toString()}
            onchange={(e) => setInitialBalance(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="flex justify-between mt-8">
          <Button
            type="submit"
            text={
              isLoading
                ? 'Saving...'
                : isEditMode
                ? 'Update Account'
                : 'Create Account'
            }
            onClick={handleSubmit}
            disabled={isLoading}
          />
          <Button
            type="button"
            text="Cancel"
            theme="danger"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          />
        </div>
      </div>
    </Slider>
  );
};

export default SliderAccount;
