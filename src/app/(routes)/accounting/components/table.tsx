import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Plus,
  FileDown,
} from 'lucide-react';
import Button from '@potta/components/button';
import Search from '@potta/components/search';
import SliderAccount from './sliderAccount';
import { accountsApi } from '../utils/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@potta/components/shadcn/dropdown';
import Image from 'next/image';

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

const TableAccount = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [availableHeight, setAvailableHeight] = useState(400);
  const [accounts, setAccounts] = useState<AccountNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDrawer, setCreateDrawer] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAccounts, setFilteredAccounts] = useState<AccountNode[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountNode | null>(
    null
  );
  const [selectedAccountType, setSelectedAccountType] = useState<string>('All');
  const [totalBalance, setTotalBalance] = useState<{ [key: string]: number }>(
    {}
  );

  // Define simplified colors for different hierarchy levels (using green, white, and gray)
  const getHierarchyColors = (level: number) => {
    const colors = [
      {
        bg: 'bg-white hover:bg-gray-50',

        border: 'border-l-4 border-green-500',
        text: 'text-gray-800',
        indicator: 'bg-green-500',
      }, // Level 0
      {
        bg: 'bg-green-50 hover:bg-green-100',
        border: 'border-l-4 border-green-400',
        text: 'text-gray-800',
        indicator: 'bg-green-400',
      }, // Level 1
      {
        bg: 'bg-gray-50 hover:bg-gray-100',
        border: 'border-l-4 border-green-300',
        text: 'text-gray-800',
        indicator: 'bg-green-300',
      }, // Level 2
      {
        bg: 'bg-white hover:bg-gray-50',
        border: 'border-l-4 border-green-200',
        text: 'text-gray-800',
        indicator: 'bg-green-200',
      }, // Level 3+
    ];

    return colors[Math.min(level, 3)];
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setIsLoading(true);
        const response = await accountsApi.getAll();
        setAccounts(response);
        setFilteredAccounts(response);

        // Calculate total balances by account type
        const balances: { [key: string]: number } = {};

        const calculateBalances = (accountList: AccountNode[]) => {
          accountList.forEach((account) => {
            if (!balances[account.type]) {
              balances[account.type] = 0;
            }
            balances[account.type] += account.currentBalance;

            if (account.children && account.children.length > 0) {
              calculateBalances(account.children);
            }
          });
        };

        calculateBalances(response);
        setTotalBalance(balances);

        // Initialize expanded state for top-level accounts
        const initialExpandedState: Record<string, boolean> = {};
        response.forEach((account: AccountNode) => {
          initialExpandedState[account.uuid] = true;
        });
        setExpandedRows(initialExpandedState);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  // Calculate available height for the table
  useEffect(() => {
    const calculateHeight = () => {
      if (containerRef?.current) {
        // Calculate height based on container position
        const containerRect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const containerTop = containerRect.top;
        const padding = 100; // Account for bottom padding and other elements
        const calculatedHeight = viewportHeight - containerTop - padding;
        setAvailableHeight(Math.max(calculatedHeight, 400));
      } else {
        // Fallback to viewport-based calculation with better offset
        const viewportHeight = window.innerHeight;
        const offset = 200; // Reduced offset for better calculation
        const calculatedHeight = viewportHeight - offset;
        setAvailableHeight(Math.max(calculatedHeight, 400));
      }
    };

    calculateHeight();

    // Use ResizeObserver for more responsive height calculation
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef?.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(calculateHeight);
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', calculateHeight);

    return () => {
      window.removeEventListener('resize', calculateHeight);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  // Filter accounts by type and search term
  useEffect(() => {
    // First filter by account type if not "All"
    let typeFiltered = accounts;
    if (selectedAccountType !== 'All') {
      const filterByType = (accountList: AccountNode[]): AccountNode[] => {
        return accountList.reduce((filtered: AccountNode[], account) => {
          if (account.type === selectedAccountType) {
            filtered.push(account);
          } else if (account.children && account.children.length > 0) {
            const filteredChildren = filterByType(account.children);
            if (filteredChildren.length > 0) {
              filtered.push({
                ...account,
                children: filteredChildren,
              });
            }
          }
          return filtered;
        }, []);
      };

      typeFiltered = filterByType(accounts);
    }

    // Then apply search term filter if any
    if (searchTerm.trim() === '') {
      setFilteredAccounts(typeFiltered);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();

    // Helper function to search through account hierarchy
    const searchAccounts = (accountList: AccountNode[]): AccountNode[] => {
      const result: AccountNode[] = [];

      for (const account of accountList) {
        // Check if current account matches search
        const nameMatches = account.name
          .toLowerCase()
          .includes(searchTermLower);
        const codeMatches = account.code
          .toLowerCase()
          .includes(searchTermLower);
        const typeMatches = account.type
          .toLowerCase()
          .includes(searchTermLower);

        // Search through children
        const matchingChildren =
          account.children.length > 0 ? searchAccounts(account.children) : [];

        // If this account or any of its children match, include it
        if (
          nameMatches ||
          codeMatches ||
          typeMatches ||
          matchingChildren.length > 0
        ) {
          // Create a copy of the account with only matching children
          const matchedAccount = {
            ...account,
            children: matchingChildren,
          };
          result.push(matchedAccount);

          // Ensure the row is expanded if it has matching children
          if (matchingChildren.length > 0) {
            setExpandedRows((prev) => ({
              ...prev,
              [account.uuid]: true,
            }));
          }
        }
      }

      return result;
    };

    const filtered = searchAccounts(typeFiltered);
    setFilteredAccounts(filtered);
  }, [searchTerm, accounts, selectedAccountType]);

  // Toggle row expansion
  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  // Format currency value
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Open account details drawer
  const openAccountDetails = (account: AccountNode) => {
    setSelectedAccount(account);
    setCreateDrawer(true);
  };

  // Create child account
  const createChildAccount = (parentAccount: AccountNode) => {
    // Set the selected account as the parent for the new account
    setSelectedAccount(parentAccount);
    setCreateDrawer(true);
  };

  // View account transactions
  const viewAccountTransactions = (accountId: string) => {
    console.log(`View transactions for account: ${accountId}`);
    // Navigate to transactions page or open transactions modal
  };

  // Delete account
  const deleteAccount = async (accountId: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      try {
        await accountsApi.delete(accountId);
        // Refresh accounts list
        const response = await accountsApi.getAll();
        setAccounts(response);
        setFilteredAccounts(response);
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  // Expand all rows
  const expandAllRows = () => {
    const allExpanded: Record<string, boolean> = {};

    const setAllExpanded = (accountList: AccountNode[]) => {
      accountList.forEach((account) => {
        allExpanded[account.uuid] = true;
        if (account.children && account.children.length > 0) {
          setAllExpanded(account.children);
        }
      });
    };

    setAllExpanded(filteredAccounts);
    setExpandedRows(allExpanded);
  };

  // Collapse all rows
  const collapseAllRows = () => {
    const allCollapsed: Record<string, boolean> = {};

    const setAllCollapsed = (accountList: AccountNode[]) => {
      accountList.forEach((account) => {
        allCollapsed[account.uuid] = false;
        if (account.children && account.children.length > 0) {
          setAllCollapsed(account.children);
        }
      });
    };

    setAllCollapsed(filteredAccounts);
    setExpandedRows(allCollapsed);
  };

  // Handle account type filter change
  const handleAccountTypeChange = (type: string) => {
    setSelectedAccountType(type);
  };

  // Recursive function to render account rows
  const renderAccountRows = (accounts: AccountNode[], level = 0) => {
    return accounts.map((account) => {
      const hasChildren = account.children && account.children.length > 0;
      const isExpanded = expandedRows[account.uuid] || false;
      const hierarchyColors = getHierarchyColors(level);

      return (
        <React.Fragment key={account.uuid}>
          <tr
            className={`${hierarchyColors.bg} ${hierarchyColors.border} h-16 transition-colors duration-200`}
          >
            <td className="py-2 px-4 h-16 flex items-center truncate">
              <div
                style={{ paddingLeft: `${level * 24}px` }}
                className="flex items-center cursor-pointer w-full"
                onClick={
                  hasChildren
                    ? () => toggleRowExpansion(account.uuid)
                    : undefined
                }
              >
                {/* Level indicator dot */}
                <div
                  className={`w-2 h-2 rounded-full ${hierarchyColors.indicator} mr-2`}
                />

                {hasChildren ? (
                  isExpanded ? (
                    <ChevronDown className="h-4 w-4 mr-2 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" />
                  )
                ) : (
                  <div className="w-6 mr-2"></div>
                )}
                <span
                  className={`truncate font-medium ${hierarchyColors.text}`}
                >
                  {account.code && (
                    <span className="opacity-70">[{account.code}]</span>
                  )}{' '}
                  {account.name}
                </span>

                {/* Show level badge for clarity */}
                <span
                  className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium bg-opacity-60 text-gray-600`}
                >
                  L{level}
                </span>
              </div>
            </td>
            <td className="py-2 px-4 truncate">
              <span
                className={`px-2 py-1 rounded-full font-medium  text-gray-800`}
              >
                {account.type}
              </span>
            </td>

            <td className="py-2 px-4 truncate">
              {formatCurrency(account.initialBalance)}
            </td>
            <td className="py-2 px-4 truncate font-medium">
              {formatCurrency(account.currentBalance)}
            </td>
            <td className="py-2 px-4 flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hover:bg-gray-100 hover:bg-opacity-50 p-1 rounded-full">
                    <MoreVertical className="h-4 w-4 text-gray-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => openAccountDetails(account)}>
                    <Eye className="mr-2 h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => createChildAccount(account)}>
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Add Child Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => viewAccountTransactions(account.uuid)}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span>Transactions</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => openAccountDetails(account)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => deleteAccount(account.uuid)}
                    className="text-red-500 focus:text-red-500"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>

          {/* Render children if expanded */}
          {isExpanded &&
            hasChildren &&
            renderAccountRows(account.children, level + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="flex flex-col bg-white h-full" ref={containerRef}>
      <div className="p-4 flex-shrink-0">
        <div className="flex justify-between mb-4">
          <div className="relative w-1/3">
            <Search
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search accounts by name, code or type..."
            />
          </div>
          <div className="w-1/2 flex items-center">
            <div className="w-full flex justify-end space-x-3">
              <Button
                type="button"
                text="Expand All"
                icon={<ChevronDown className="h-4 w-4" />}
                theme="lightBlue"
                className="!text-black whitespace-nowrap"
                onClick={expandAllRows}
              />
              <Button
                type="button"
                text="Collapse All"
                icon={<ChevronRight className="h-4 w-4" />}
                theme="lightBlue"
                className="!text-black whitespace-nowrap"
                onClick={collapseAllRows}
              />
              <Button
                type="button"
                text="Export"
                icon={<FileDown className="h-4 w-4" />}
                theme="lightBlue"
                className="!text-black whitespace-nowrap"
              />
              <Button
                type="button"
                text="Create Account"
                icon={<i className="ri-file-add-line"></i>}
                theme="default"
                className="whitespace-nowrap"
                onClick={() => {
                  setSelectedAccount(null);
                  setCreateDrawer(true);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Account Table */}
      <div className="flex-1 flex flex-col overflow-hidden px-4 pb-4">
        <div className="flex-shrink-0">
          <table className="w-full table-fixed">
            <colgroup>
              <col style={{ width: '30%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '15%' }} />
            </colgroup>
            <thead className="bg-green-50 h-16 border border-gray-200">
              <tr className="text-lg border-gray-200">
                <th className="text-left font-medium py-2 px-4 text-gray-800">
                  Account Name
                </th>
                <th className="text-left py-2 px-4 text-gray-800">Type</th>
                <th className="text-left py-2 px-4 text-gray-800">
                  Initial Balance
                </th>
                <th className="text-left py-2 px-4 text-gray-800">
                  Current Balance
                </th>
                <th className="text-center py-2 px-4 text-gray-800">Actions</th>
              </tr>
            </thead>
          </table>
        </div>

        <div
          className="flex-1 overflow-y-auto"
          style={{ maxHeight: `${availableHeight}px` }}
        >
          <table className="w-full table-fixed">
            <colgroup>
              <col style={{ width: '30%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '15%' }} />
            </colgroup>
            <tbody className="text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Loading accounts...
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No accounts found.
                  </td>
                </tr>
              ) : (
                renderAccountRows(filteredAccounts)
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SliderAccount
        open={isCreateDrawer}
        setOpen={setCreateDrawer}
        account={selectedAccount}
        onAccountSaved={() => {
          setCreateDrawer(false);
          // Refresh accounts after saving
          accountsApi.getAll().then((response) => {
            setAccounts(response);
            setFilteredAccounts(response);
          });
        }}
      />
    </div>
  );
};

export default TableAccount;
