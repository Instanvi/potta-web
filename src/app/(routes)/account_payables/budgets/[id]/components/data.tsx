'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  CheckCircle,
  Clock,
  Archive,
  AlertCircle,
  Loader2,
  DollarSign,
  MoreVertical,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@potta/components/avatar';
import { budgetsApi } from '../../utils/api';
import { Budget } from '../../utils/types';
import { Button } from '@potta/components/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@potta/components/shadcn/dialog';
import { Input } from '@potta/components/shadcn/input';
import { Label } from '@potta/components/shadcn/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@potta/components/shadcn/select';
import { Skeleton } from '@potta/components/shadcn/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';

const SingleBudget = () => {
  const { id } = useParams();
  const router = useRouter();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [fundDialogOpen, setFundDialogOpen] = useState(false);
  const [fundingAmount, setFundingAmount] = useState('');
  const [cashAccountId, setCashAccountId] = useState('');
  const [equityAccountId, setEquityAccountId] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  // Mock accounts for demo purposes - in a real app, these would be fetched from API
  const mockCashAccounts = [
    { id: 'cash-account-1', name: 'Main Cash Account' },
    { id: 'cash-account-2', name: 'Petty Cash' },
    { id: 'bank-account-1', name: 'Main Bank Account' },
  ];

  const mockEquityAccounts = [
    { id: 'equity-account-1', name: 'Budget Funding Account' },
    { id: 'equity-account-2', name: 'General Reserves' },
  ];

  useEffect(() => {
    // Get the current user ID - in a real app, this would come from auth context
    // For demo, we'll use the approver ID from the payload
    setCurrentUserId('262406e4-125c-413c-a9ed-160da4d7bf2f'); // John Doe's ID

    const fetchBudget = async () => {
      try {
        setLoading(true);
        const data = await budgetsApi.getBudget(id as string);
        setBudget(data);
      } catch (error) {
        console.error('Error fetching budget:', error);
        toast.error('Failed to load budget details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBudget();
    }
  }, [id]);

  const handleArchiveBudget = async () => {
    if (!budget) return;

    try {
      setActionLoading('archive');
      await budgetsApi.archiveBudget(budget.uuid, {
        organizationId: budget.organizationId,
        branchId: budget.branchId,
      });

      toast.success(`Budget "${budget.name}" has been archived successfully.`);

      // Refresh the budget data
      const updatedBudget = await budgetsApi.getBudget(id as string);
      setBudget(updatedBudget);
    } catch (error) {
      console.error('Error archiving budget:', error);
      toast.error('There was an error archiving the budget. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFundBudget = async () => {
    if (!budget || !fundingAmount || !cashAccountId || !equityAccountId) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(fundingAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount greater than zero');
      return;
    }

    try {
      setActionLoading('fund');
      await budgetsApi.fundBudget(
        budget.uuid,
        {
          amount,
          cashOrBankAccountId: cashAccountId,
          budgetFundingEquityAccountId: equityAccountId,
        },
        {
          organizationId: budget.organizationId,
          branchId: budget.branchId,
        }
      );

      toast.success(
        `Budget "${
          budget.name
        }" has been funded successfully with XAF ${formatCurrency(amount)}.`
      );

      // Close the dialog
      setFundDialogOpen(false);

      // Reset form
      setFundingAmount('');
      setCashAccountId('');
      setEquityAccountId('');

      // Refresh the budget data
      const updatedBudget = await budgetsApi.getBudget(id as string);
      setBudget(updatedBudget);
    } catch (error) {
      console.error('Error funding budget:', error);
      toast.error('There was an error funding the budget. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex mb-5 flex-col md:flex-row justify-between gap-6">
        <div className="flex flex-col border py-4 px-4 w-full md:w-3/4">
          <div className="flex justify-between px-3">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="mt-5">
            <Skeleton className="h-2 w-full" />
          </div>
          <div className="flex justify-between px-3 mt-5">
            <div className="flex gap-3 w-1/3">
              <Skeleton className="h-3 w-3 rounded-full" />
              <div className="flex flex-col">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex gap-3 w-1/3">
              <Skeleton className="h-3 w-3 rounded-full" />
              <div className="flex flex-col">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex gap-3 w-1/3">
              <Skeleton className="h-3 w-3 rounded-full" />
              <div className="flex flex-col">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </div>

        {/* Policies section skeleton */}
        <div className="flex border flex-col w-full md:w-1/4 h-full py-2.5 px-6">
          <div className="flex justify-between">
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex grow justify-center items-center">
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-red-500">Budget not found or has been deleted.</p>
      </div>
    );
  }

  // Calculate amounts and percentages
  const totalAmount = parseFloat(budget.totalAmount);
  const availableAmount = parseFloat(budget.availableAmount);
  const accountBalance = budget.budgetedAccount?.initialBalance
    ? parseFloat(budget.budgetedAccount.initialBalance.toString())
    : 0;
  const spentAmount = totalAmount - availableAmount;

  // Calculate progress percentages
  const spentPercent = totalAmount > 0 ? (spentAmount / totalAmount) * 100 : 0;
  const availablePercent =
    totalAmount > 0 ? (availableAmount / totalAmount) * 100 : 0;
  const remainingPercent = Math.max(0, 100 - spentPercent - availablePercent);

  // Get status info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          text: 'Approved',
          color: 'text-green-500',
          bgColor: 'bg-green-50',
        };
      case 'PENDING':
        return {
          icon: <Clock className="h-5 w-5 text-amber-500" />,
          text: 'Pending',
          color: 'text-amber-500',
          bgColor: 'bg-amber-50',
        };
      case 'ARCHIVED':
        return {
          icon: <Archive className="h-5 w-5 text-gray-500" />,
          text: 'Archived',
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
        };
      case 'REJECTED':
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          text: 'Rejected',
          color: 'text-red-500',
          bgColor: 'bg-red-50',
        };
      default:
        return {
          icon: <Clock className="h-5 w-5 text-gray-500" />,
          text: 'Unknown',
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
        };
    }
  };

  const statusInfo = getStatusInfo(budget.status);

  function formatCurrency(amount: number): React.ReactNode {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  function getApproverName(approver: any): string {
    if (approver.approver?.firstName && approver.approver?.lastName) {
      return `${approver.approver.firstName} ${approver.approver.lastName}`;
    }
    return getInitialsFromId(approver.approverId);
  }

  function getInitialsFromId(approverId: string): string {
    // If we have a name, get initials from it
    if (approverId.includes(' ')) {
      const parts = approverId.split(' ');
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    // Split the ID by any non-word characters and take first 2 parts
    const parts = approverId
      .split(/[^a-zA-Z]/)
      .filter((part) => part.length > 0);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    // If we can't get 2 initials, just return first 2 characters of ID
    return approverId.slice(0, 2).toUpperCase();
  }

  // Format recurrence information
  const getRecurrenceInfo = () => {
    if (!budget.recurrenceType || budget.recurrenceType === 'NONE') {
      return 'No recurrence';
    }

    const interval = budget.recurrenceInterval || 1;
    const type = budget.recurrenceType.toLowerCase();
    const endDate = budget.recurrenceEndDate
      ? new Date(budget.recurrenceEndDate).toLocaleDateString()
      : 'No end date';

    return `${type === 'monthly' ? 'Monthly' : 'Weekly'} (every ${interval} ${
      interval === 1 ? type.slice(0, -2) : type
    }) until ${endDate}`;
  };

  // Determine if this is a recurring budget instance
  const isRecurringInstance =
    budget.originalBudgetId && !budget.isRecurringParent;

  // Determine if the budget needs funding (account balance is low)
  const needsFunding = accountBalance < 5000 && budget.status === 'APPROVED';

  return (
    <>
      <div className="flex mb-5 flex-col md:flex-row justify-between gap-6">
        <div className="flex flex-col border py-4 px-4 w-full md:w-3/4">
          <div className="flex justify-between px-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-medium">{budget.name}</h1>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}
                >
                  {statusInfo.icon}
                  <span className="text-sm">{statusInfo.text}</span>
                </div>
              </div>
            </div>
            {budget.status !== 'ARCHIVED' && (
              <Button
                variant="outline"
                size="sm"
                disabled={actionLoading === 'archive'}
                onClick={handleArchiveBudget}
                className="flex items-center gap-2"
              >
                {actionLoading === 'archive' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Archiving...
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4" />
                    Archive Budget
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden mt-5">
            {/* Initial/Allocated (Yellow) */}
            <div
              className="absolute left-0 top-0 h-full bg-yellow-500"
              style={{ width: `${totalAmount > 0 ? 100 : 0}%` }}
            />
            {/* Spent (Red) */}
            <div
              className="absolute left-0 top-0 h-full bg-red-500"
              style={{ width: `${spentPercent}%` }}
            />
            {/* Available (Green) */}
            <div
              className="absolute h-full bg-green-500"
              style={{
                left: `${spentPercent}%`,
                width: `${availablePercent}%`,
              }}
            />
          </div>

          <div className="flex justify-between px-3 mt-5">
            <div className="flex gap-3 w-1/3">
              <div className="flex w-3 h-3 mt-1.5 bg-red-500 rounded-full"></div>
              <div className="flex flex-col">
                <p className="font-medium text-balse">Spent</p>
                <p className="text-sm">XAF {formatCurrency(spentAmount)}</p>
              </div>
            </div>
            <div className="flex gap-3 w-1/3">
              <div className="flex w-3 h-3 mt-1.5 bg-yellow-500 rounded-full"></div>
              <div className="flex flex-col">
                <p className="font-medium text-balse">Allocated</p>
                <p className="text-sm">XAF {formatCurrency(totalAmount)}</p>
              </div>
            </div>
            <div className="flex gap-3 w-1/3">
              <div className="flex w-3 h-3 mt-1.5 bg-green-500 rounded-full"></div>
              <div className="flex flex-col">
                <p className="font-medium text-balse">Available</p>
                <p className="text-sm">XAF {formatCurrency(availableAmount)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Policies section */}
        <div className="flex border flex-col w-full md:w-1/4 min-h-full py-2.5 px-6">
          <div className="flex justify-between">
            <h1>Policies</h1>
          </div>
          <div className="flex grow justify-center items-center">
            {budget.policies && budget.policies.length > 0 ? (
              <div className="w-full">
                {budget.policies.map((policy) => (
                  <div key={policy.uuid} className="py-2 border-b">
                    <p className="font-medium">{policy.name}</p>
                    <p className="text-xs text-gray-500">
                      Status: {policy.status}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No policies attached</p>
            )}
          </div>
        </div>
      </div>

      {/* Fund Budget Dialog */}
      <Dialog open={fundDialogOpen} onOpenChange={setFundDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Fund Budget</DialogTitle>
            <DialogDescription>
              Add funds to the budget "{budget.name}". This will increase the
              available amount.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  XAF
                </span>
                <Input
                  id="amount"
                  type="number"
                  className="pl-12"
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cash-account" className="text-right">
                Cash Account
              </Label>
              <Select value={cashAccountId} onValueChange={setCashAccountId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select cash or bank account" />
                </SelectTrigger>
                <SelectContent>
                  {mockCashAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="equity-account" className="text-right">
                Equity Account
              </Label>
              <Select
                value={equityAccountId}
                onValueChange={setEquityAccountId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select equity account" />
                </SelectTrigger>
                <SelectContent>
                  {mockEquityAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFundDialogOpen(false)}
              disabled={actionLoading === 'fund'}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFundBudget}
              disabled={
                actionLoading === 'fund' ||
                !fundingAmount ||
                !cashAccountId ||
                !equityAccountId
              }
            >
              {actionLoading === 'fund' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Funding...
                </>
              ) : (
                'Fund Budget'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SingleBudget;
