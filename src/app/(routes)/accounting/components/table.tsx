import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { ChevronDown, ChevronRight, MoreVertical, Plus, FileDown } from 'lucide-react';
import Button from '@potta/components/button';
import Search from '@potta/components/search';
import SliderAccount from './sliderAccount';
import { accountsApi } from '../utils/api';
import { ACCOUNT_TYPES } from '../utils/validations';
import { StatCard, StatusBadge } from '../../_shared/states';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import { Can, useCan } from '@/components/auth/can';

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
  const { canAccess } = useCan();
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

  const getHierarchyColors = (level: number) => {
    const indicators = ['bg-primary', 'bg-primary-400', 'bg-primary-300', 'bg-primary-200'];
    return {
      text: level === 0 ? 'font-medium text-foreground' : 'text-foreground',
      indicator: indicators[Math.min(level, 3)],
    };
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
            balances[account.type] += Number(account.currentBalance) || 0;

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
      } catch {
        setAccounts([]);
        setFilteredAccounts([]);
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
  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  const createChildAccount = (parentAccount: AccountNode) => {
    setSelectedAccount(parentAccount);
    setCreateDrawer(true);
  };

  const exportAccounts = () => {
    const rows: string[][] = [['Code', 'Name', 'Type', 'Level', 'Initial balance', 'Current balance']];
    const walk = (list: AccountNode[], level: number) =>
      list.forEach((account) => {
        rows.push([
          account.code ?? '',
          account.name,
          account.type,
          String(level),
          String(Number(account.initialBalance) || 0),
          String(Number(account.currentBalance) || 0),
        ]);
        if (account.children?.length) walk(account.children, level + 1);
      });
    walk(filteredAccounts, 0);
    const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chart-of-accounts.csv';
    link.click();
    URL.revokeObjectURL(url);
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
          <tr className="h-12 border-b border-black/[0.06] transition-colors hover:bg-black/[0.02]">
            <td className="flex h-12 items-center truncate px-4 py-2">
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
                <div className={`mr-2 size-1.5 rounded-full ${hierarchyColors.indicator}`} />

                {hasChildren ? (
                  isExpanded ? (
                    <ChevronDown className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  )
                ) : (
                  <div className="mr-2 w-4"></div>
                )}
                <span className={`truncate text-sm ${hierarchyColors.text}`}>
                  {account.code && (
                    <span className="mr-1.5 tabular-nums text-muted-foreground">{account.code}</span>
                  )}
                  {account.name}
                </span>
              </div>
            </td>
            <td className="truncate px-4 py-2">
              <StatusBadge>
                {account.type.charAt(0) + account.type.slice(1).toLowerCase()}
              </StatusBadge>
            </td>

            <td className="truncate px-4 py-2 text-sm tabular-nums text-muted-foreground">
              {formatCurrency(account.initialBalance)}
            </td>
            <td className="truncate px-4 py-2 text-sm font-medium tabular-nums">
              {formatCurrency(account.currentBalance)}
            </td>
            <td className="flex justify-center px-4 py-2">
              {canAccess('Accounts', 'create') && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="rounded-[2px] p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => createChildAccount(account)}>
                      <Plus className="mr-2 h-4 w-4" />
                      <span>Add child account</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
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
    <div className="flex h-full flex-col gap-4" ref={containerRef}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {ACCOUNT_TYPES.map((type) => (
          <StatCard
            key={type}
            label={type.charAt(0) + type.slice(1).toLowerCase()}
            value={isLoading ? '—' : formatCurrency(totalBalance[type] ?? 0)}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Search
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm('')}
          placeholder="Search accounts by name, code or type"
          className="w-full sm:max-w-xs"
        />
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button
            type="button"
            text="Expand all"
            icon={<ChevronDown className="h-4 w-4" />}
            theme="outline"
            onClick={expandAllRows}
          />
          <Button
            type="button"
            text="Collapse all"
            icon={<ChevronRight className="h-4 w-4" />}
            theme="outline"
            onClick={collapseAllRows}
          />
          <Button
            type="button"
            text="Export"
            icon={<FileDown className="h-4 w-4" />}
            theme="lightBlue"
            onClick={exportAccounts}
            disabled={filteredAccounts.length === 0}
          />
          <Can resource="Accounts" action="create">
            <Button
              type="button"
              text="Create account"
              icon={<Plus className="h-4 w-4" />}
              theme="default"
              onClick={() => {
                setSelectedAccount(null);
                setCreateDrawer(true);
              }}
            />
          </Can>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-[2px] border border-black/[0.08] bg-card">
        <div className="flex-shrink-0">
          <table className="w-full table-fixed">
            <colgroup>
              <col style={{ width: '36%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>
            <thead className="bg-table-head">
              <tr className="h-12 border-b border-black/10">
                <th className="px-4 text-left text-sm font-normal text-foreground">Account</th>
                <th className="px-4 text-left text-sm font-normal text-foreground">Type</th>
                <th className="px-4 text-left text-sm font-normal text-foreground">Initial balance</th>
                <th className="px-4 text-left text-sm font-normal text-foreground">Current balance</th>
                <th className="px-4 text-center text-sm font-normal text-foreground"></th>
              </tr>
            </thead>
          </table>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ maxHeight: `${availableHeight}px` }}>
          <table className="w-full table-fixed">
            <colgroup>
              <col style={{ width: '36%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="h-32 text-center text-sm text-muted-foreground">
                    Loading accounts…
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-32 text-center text-sm text-muted-foreground">
                    {searchTerm ? 'No accounts match your search.' : 'No accounts yet.'}
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
