'use client';
import React, { useState, useMemo } from 'react';
import { MoreVertical, Eye, Trash2, BookOpen } from 'lucide-react';
import { useGetPolicies } from '../hooks/policyHooks';
import Search from '@potta/components/search';
import Button from '@potta/components/button';
import { Icon } from '@iconify/react';
import { IFilter } from '../utils/types';
import CreateRuleModal from './createRuleModal';
import ViewPolicyModal from './viewPolicyModal';
import DeletePolicyModal from './deletePolicyModal';
import { ExtendedApprovalRule } from '../../policy/types/approval-rule';
import DataGrid from '../../account_receivables/invoice/components/DataGrid';
import { IColumnDef } from '../../account_receivables/_utils/types';
import { HeaderContext } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@potta/components/shadcn/dialog';
import toast from 'react-hot-toast';
import CustomLoader from '@potta/components/loader';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@potta/components/card';
import { Progress } from '@potta/components/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@potta/components/avatar';

// Define types based on the API response
interface MileageRequirements {
  requireBeforeAfterScreenshots: boolean;
  requireGpsCoordinates: boolean;
  businessPurpose: boolean;
}

interface Condition {
  id: string;
  criterionType: string;
  comparisonOperator: string;
  value: number;
}

interface Action {
  id: string;
  type: string;
  parameters: {
    originalActionType: string;
    approverType: string;
    selectedUserIds: string[];
    approvalMode: string;
  };
}

interface Rule {
  id: string;
  conditionOperator: string;
  conditions: Condition[];
  actions: Action[];
}

interface Policy {
  id: string;
  name: string;
  documentUrl: string | null;
  requireReceipt: boolean;
  requireMemo: boolean;
  requireScreenshots: boolean;
  requireNetSuiteCustomerJob: boolean;
  additionalRequirements: string | null;
  transactionType: string;
  type: string;
  mileageRequirements: MileageRequirements | null;
  branchId: string;
  rules: Rule[];
  status: string; // Added status for the new PolicyCard
}

interface ApiResponse {
  data: Policy[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
}

const requirementIcons: Record<
  string,
  { icon: React.ReactNode; label: string; description: string }
> = {
  requireReceipt: {
    icon: <i className="ri-receipt-2-line text-gray-600" />,
    label: 'Receipt Required',
    description: 'Must attach receipt for this expense',
  },
  requireMemo: {
    icon: <i className="ri-file-text-line text-gray-600" />,
    label: 'Memo Required',
    description: 'Must provide a memo explaining the expense',
  },
  requireScreenshots: {
    icon: <i className="ri-image-line text-gray-600" />,
    label: 'Screenshots Required',
    description: 'Must attach screenshots as proof',
  },
  requireNetSuiteCustomerJob: {
    icon: <i className="ri-briefcase-line text-gray-600" />,
    label: 'NetSuite Customer/Job',
    description: 'Must select NetSuite customer or job',
  },
  requireGpsCoordinates: {
    icon: <i className="ri-map-pin-line text-gray-600" />,
    label: 'GPS Coordinates',
    description: 'Must include GPS location data',
  },
  businessPurpose: {
    icon: <i className="ri-building-2-line text-gray-600" />,
    label: 'Business Purpose',
    description: 'Must specify business purpose',
  },
  requireBeforeAfterScreenshots: {
    icon: <i className="ri-split-cells-horizontal text-gray-600" />,
    label: 'Before/After Screenshots',
    description: 'Must provide before and after screenshots',
  },
};

const PolicyCard = ({
  policy,
  onView,
  onDelete,
}: {
  policy: Policy;
  onView: (policy: Policy) => void;
  onDelete: (policy: Policy) => void;
}) => {
  const requirements = policy.rules[0]?.requirements || {
    requireReceipt: false,
    requireMemo: false,
    requireScreenshots: false,
    requireNetSuiteCustomerJob: false,
    requireGpsCoordinates: false,
    businessPurpose: false,
    requireBeforeAfterScreenshots: false,
  };

  const activeRequirements = Object.entries(requirements).filter(
    ([, value]) => value
  );

  return (
    <Card className="relative overflow-hidden bg-white shadow-sm  transition-all duration-200 cursor-pointer border border-gray-200">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500 to-green-600" />
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg font-medium truncate text-gray-900">
                {policy.name}
              </CardTitle>
              <span
                className={`px-2 py-1 text-xs font-medium ${
                  policy.status === 'active'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                }`}
              >
                {policy.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <i className="ri-settings-3-line text-gray-400"></i>
                {policy.rules.length}{' '}
                {policy.rules.length === 1 ? 'Rule' : 'Rules'}
              </span>
              {policy.transactionType && (
                <span className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-200 text-xs">
                  <i className="ri-exchange-line text-gray-400"></i>
                  {policy.transactionType}
                </span>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 hover:bg-gray-100 transition-colors">
                <MoreVertical size={16} className="text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => onView(policy)}
                className="cursor-pointer"
              >
                <Icon
                  icon="material-symbols:visibility-outline"
                  className="mr-2 h-4 w-4"
                />
                <span>View Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(policy)}
                className="text-red-600 cursor-pointer"
              >
                <Icon
                  icon="material-symbols:delete-outline"
                  className="mr-2 h-4 w-4"
                />
                <span>Delete Policy</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <div className="space-y-3">
          {/* Requirements Section - Compact */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">
                Requirements
              </span>
              <span className="text-xs text-gray-500">
                ({activeRequirements.length})
              </span>
            </div>
            {activeRequirements.length === 0 ? (
              <div className="text-sm text-gray-500 italic">
                No special requirements
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {activeRequirements.map(([key, value]) => {
                  const req = requirementIcons[key];
                  return req ? (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-200 text-xs text-gray-700"
                    >
                      {req.icon}
                      {req.label}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Rules Summary - Compact */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">
                Rules Summary
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {policy.rules.map((rule, idx) => (
                <span
                  key={rule.id || idx}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 text-xs text-green-700"
                >
                  <i className="ri-settings-3-line text-green-600"></i>
                  Rule {idx + 1}: {rule.conditions.length} cond. /{' '}
                  {rule.actions.length} act.
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PolicyTable = () => {
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const filter: IFilter = {
    limit,
    page,
    sortOrder: 'DESC',
    sortBy: 'createdAt',
  };

  const { data, isLoading, error, refetch } = useGetPolicies(filter);

  const getRequirementsText = (policy: Policy) => {
    const requirements = [];
    if (policy.requireReceipt) requirements.push('Receipt');
    if (policy.requireMemo) requirements.push('Memo');
    if (policy.requireScreenshots) requirements.push('Screenshots');
    if (policy.requireNetSuiteCustomerJob)
      requirements.push('NetSuite Customer/Job');

    return requirements.join(', ') || 'None';
  };

  const getRulesSummary = (rules: Rule[]) => {
    if (!rules || rules.length === 0) return 'No rules';

    return `${rules.length} rule${rules.length > 1 ? 's' : ''}`;
  };

  const handleViewPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsViewModalOpen(true);
  };

  const handleDeletePolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsDeleteModalOpen(true);
  };

  const handleStudyPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsStudyModalOpen(true);
  };

  const confirmDeletePolicy = async () => {
    if (!selectedPolicy) return;

    try {
      // TODO: Implement delete policy API call
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API call
      toast.success('Policy deleted successfully');
      setIsDeleteModalOpen(false);
      refetch();
    } catch (error) {
      toast.error('Failed to delete policy');
    }
  };

  const columns = useMemo<IColumnDef<Policy>[]>(
    () => [
      {
        header: (_: HeaderContext<Policy, unknown>) => 'Policy Name',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div className="text-sm font-medium">{row.original.name}</div>
        ),
      },
      {
        header: (_: HeaderContext<Policy, unknown>) => 'Requirements',
        accessorKey: 'requirements',
        cell: ({ row }) => (
          <div className="text-sm text-gray-500">
            {getRequirementsText(row.original)}
          </div>
        ),
      },
      {
        header: (_: HeaderContext<Policy, unknown>) => 'Rules',
        accessorKey: 'rules',
        cell: ({ row }) => (
          <div className="text-sm">{getRulesSummary(row.original.rules)}</div>
        ),
      },
      {
        header: (_: HeaderContext<Policy, unknown>) => 'Status',
        accessorKey: 'status',
        cell: ({ row }) => {
          const status = 'Active';
          return (
            <div className="flex justify-">
              <div className="flex items- gap-3 w-[120px] px-3 py-2 border border-green-500 bg-green-50 text-green-700">
                <div className="flex items-center justify-center text-white bg-green-700 rounded-full size-4">
                  <Icon icon="material-symbols:check" width="20" height="20" />
                </div>
                {status}
              </div>
            </div>
          );
        },
      },
      {
        header: (_: HeaderContext<Policy, unknown>) => '',
        accessorKey: 'actions',
        cell: ({ row }) => (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleViewPolicy(row.original)}
                >
                  <Icon
                    icon="material-symbols:visibility-outline"
                    className="mr-2 h-4 w-4"
                  />
                  <span>View Policy</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeletePolicy(row.original)}
                  className="text-red-600"
                >
                  <Icon
                    icon="material-symbols:delete-outline"
                    className="mr-2 h-4 w-4"
                  />
                  <span>Delete Policy</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    []
  );

  const handleCreateRule = async (ruleData: ExtendedApprovalRule) => {
    // After successful creation, refetch the policies
    await refetch();
  };

  if (error) {
    return (
      <div className={'w-full py-24 flex flex-col items-center justify-center'}>
        An Error Occurred
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex justify-between w-full">
        <div className="mt-5 w-[50%] flex items-center space-x-2">
          <div className="w-[65%]">
            <Search />
          </div>
        </div>
        <div className="w-[50%] flex justify-end">
          <div className="flex mt-10 space-x-2">
            <div>
              <Button
                text={'Export'}
                icon={<i className="ri-upload-2-line"></i>}
                theme="lightBlue"
                type={'button'}
                color={true}
              />
            </div>
            <div>
              <Button
                text={'Create Rule'}
                icon={<i className="ri-file-add-line"></i>}
                theme="default"
                type={'button'}
                onClick={() => setIsCreateModalOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <Card className="bg-white">
                <CardHeader className="pb-6">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                    </div>
                    <div className="h-8 w-8 bg-gray-200 rounded" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                      <div className="flex gap-2">
                        <div className="h-6 bg-gray-200 rounded w-20" />
                        <div className="h-6 bg-gray-200 rounded w-20" />
                      </div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                      <div className="space-y-2">
                        <div className="h-12 bg-gray-200 rounded" />
                        <div className="h-12 bg-gray-200 rounded" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.data.map((policy) => (
            <PolicyCard
              key={policy.uuid}
              policy={policy}
              onView={handleViewPolicy}
              onDelete={handleDeletePolicy}
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex items-center justify-center h-48 ">
          <p className="text-gray-500">No policies found</p>
        </div>
      )}

      <CreateRuleModal
        open={isCreateModalOpen}
        setOpen={setIsCreateModalOpen}
        onSave={handleCreateRule}
      />

      <ViewPolicyModal
        open={isViewModalOpen}
        setOpen={setIsViewModalOpen}
        policy={selectedPolicy}
      />

      <DeletePolicyModal
        open={isDeleteModalOpen}
        setOpen={setIsDeleteModalOpen}
        policy={selectedPolicy}
        onDelete={refetch}
      />

      {/* Study Policy Modal */}
      <Dialog open={isStudyModalOpen} onOpenChange={setIsStudyModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Study Policy</DialogTitle>
            <DialogDescription>
              Review and understand the policy details
            </DialogDescription>
          </DialogHeader>
          {selectedPolicy && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 ">
                <h3 className="font-medium text-lg mb-2">Policy Overview</h3>
                <p className="text-gray-600">{selectedPolicy.name}</p>
              </div>

              <div className="bg-gray-50 p-4 ">
                <h3 className="font-medium text-lg mb-2">Requirements</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {selectedPolicy.requireReceipt && <li>Receipt Required</li>}
                  {selectedPolicy.requireMemo && <li>Memo Required</li>}
                  {selectedPolicy.requireScreenshots && (
                    <li>Screenshots Required</li>
                  )}
                  {selectedPolicy.requireNetSuiteCustomerJob && (
                    <li>NetSuite Customer/Job Required</li>
                  )}
                </ul>
              </div>

              <div className="bg-gray-50 p-4 ">
                <h3 className="font-medium text-lg mb-2">Rules</h3>
                {selectedPolicy.rules.map((rule, index) => (
                  <div key={rule.id} className="mb-4 last:mb-0">
                    <h4 className="font-medium mb-2">Rule {index + 1}</h4>
                    <div className="pl-4">
                      <p className="text-gray-600">Conditions:</p>
                      <ul className="list-disc list-inside text-gray-600">
                        {rule.conditions.map((condition) => (
                          <li key={condition.id}>
                            {condition.criterionType}{' '}
                            {condition.comparisonOperator} {condition.value}
                          </li>
                        ))}
                      </ul>
                      <p className="text-gray-600 mt-2">Actions:</p>
                      <ul className="list-disc list-inside text-gray-600">
                        {rule.actions.map((action) => (
                          <li key={action.id}>
                            {action.type} - {action.parameters.approvalMode}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {selectedPolicy.additionalRequirements && (
                <div className="bg-gray-50 p-4 ">
                  <h3 className="font-medium text-lg mb-2">
                    Additional Requirements
                  </h3>
                  <p className="text-gray-600">
                    {selectedPolicy.additionalRequirements}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PolicyTable;
