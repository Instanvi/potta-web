'use client';
import React, { useState, useMemo } from 'react';
import { MoreVertical, Eye, Trash2, BookOpen, Plus } from 'lucide-react';
import { useGetPolicies } from '../../../policies/hooks/policyHooks';
import Search from '@potta/components/search';
import Button from '@potta/components/button';
import { Icon } from '@iconify/react';
import CreateRuleModal from '../../../policies/components/createRuleModal';
import ViewPolicyModal from '../../../policies/components/viewPolicyModal';
import DeletePolicyModal from '../../../policies/components/deletePolicyModal';
import { ExtendedApprovalRule } from '../../../policy/types/approval-rule';
import RiskPolicyTable from '../../../policies/components/RiskPolicyTable';
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
  status: string;
}

interface PolicyTableProps {
  activeTab: string;
  activeSubmenu: string | null;
}

const requirementIcons: Record<string, string> = {
  receipt: 'ri-receipt-line',
  memo: 'ri-file-text-line',
  screenshots: 'ri-camera-line',
  netsuite: 'ri-database-2-line',
  mileage: 'ri-route-line',
  gps: 'ri-map-pin-line',
  business: 'ri-briefcase-line',
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
  const getRequirementsText = (policy: Policy) => {
    const requirements = [];
    if (policy.requireReceipt) requirements.push('Receipt');
    if (policy.requireMemo) requirements.push('Memo');
    if (policy.requireScreenshots) requirements.push('Screenshots');
    if (policy.requireNetSuiteCustomerJob) requirements.push('NetSuite');
    return requirements.join(', ');
  };

  const getRulesSummary = (rules: Rule[]) => {
    if (!rules || rules.length === 0) return 'No rules';
    return `${rules.length} rule${rules.length > 1 ? 's' : ''}`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-medium text-gray-900 mb-2">
              {policy.name}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                  policy.status
                )}`}
              >
                {policy.status || 'Active'}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                {policy.transactionType || policy.type}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(policy)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(policy)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Requirements */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Requirements
            </h4>
            <div className="flex flex-wrap gap-1">
              {policy.requireReceipt && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                  <Icon icon={requirementIcons.receipt} className="mr-1" />
                  Receipt
                </span>
              )}
              {policy.requireMemo && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                  <Icon icon={requirementIcons.memo} className="mr-1" />
                  Memo
                </span>
              )}
              {policy.requireScreenshots && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                  <Icon icon={requirementIcons.screenshots} className="mr-1" />
                  Screenshots
                </span>
              )}
              {policy.requireNetSuiteCustomerJob && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                  <Icon icon={requirementIcons.netsuite} className="mr-1" />
                  NetSuite
                </span>
              )}
            </div>
          </div>

          {/* Rules Summary */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Rules</h4>
            <p className="text-sm text-gray-600">
              {getRulesSummary(policy.rules)}
            </p>
          </div>

          {/* Additional Requirements */}
          {policy.additionalRequirements && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                Additional Requirements
              </h4>
              <p className="text-sm text-gray-600 line-clamp-2">
                {policy.additionalRequirements}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PolicyTable: React.FC<PolicyTableProps> = ({
  activeTab,
  activeSubmenu,
}) => {
  // For risk policies, use the new RiskPolicyTable component
  if (activeTab === 'risk') {
    return (
      <RiskPolicyTable activeTab={activeTab} activeSubmenu={activeSubmenu} />
    );
  }
  const [searchValue, setSearchValue] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  // Get policies data
  const { data, isLoading, error, refetch } = useGetPolicies();

  const getRequirementsText = (policy: Policy) => {
    const requirements = [];
    if (policy.requireReceipt) requirements.push('Receipt');
    if (policy.requireMemo) requirements.push('Memo');
    if (policy.requireScreenshots) requirements.push('Screenshots');
    if (policy.requireNetSuiteCustomerJob) requirements.push('NetSuite');
    return requirements.join(', ');
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
      // Add delete API call here
      toast.success('Policy deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedPolicy(null);
      refetch();
    } catch (error) {
      toast.error('Failed to delete policy');
    }
  };

  const handleCreateRule = async (ruleData: ExtendedApprovalRule) => {
    try {
      // Add create rule API call here
      toast.success('Rule created successfully');
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      toast.error('Failed to create rule');
    }
  };

  // Filter policies based on active tab and submenu
  const filteredPolicies = useMemo(() => {
    if (!data?.data) return [];

    let filtered = data.data;

    // Filter by active tab
    if (activeTab !== 'all') {
      filtered = filtered.filter((policy: Policy) => {
        const policyType = policy.transactionType || policy.type;
        switch (activeTab) {
          case 'expense':
            return ['reimbursement', 'bills', 'spendRequests'].includes(
              policyType
            );
          case 'mileage':
            return ['mileage', 'travel'].includes(policyType);
          case 'vendor':
            return ['vendors', 'vendorApproval'].includes(policyType);
          case 'card':
            return ['cards', 'cardLimits'].includes(policyType);
          case 'general':
            return ['approval', 'compliance'].includes(policyType);
          default:
            return true;
        }
      });
    }

    // Filter by search value
    if (searchValue) {
      filtered = filtered.filter(
        (policy: Policy) =>
          policy.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          policy.transactionType
            ?.toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          policy.type?.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    return filtered;
  }, [data?.data, activeTab, activeSubmenu, searchValue]);

  if (error) {
    return (
      <div className="mt-10">
        <div className="text-center text-gray-500 py-8">
          <p className="text-red-600">
            An error occurred while fetching policies. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <Search
            placeholder="Search policies..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onClear={() => setSearchValue('')}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            text="Create Policy"
            icon={<i className="ri-file-add-line"></i>}
            theme="default"
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
          />
        </div>
      </div>

      {/* Policies Grid */}
      {isLoading ? (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-20" />
                    <div className="h-6 bg-gray-200 rounded w-20" />
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
          ))}
        </div>
      ) : filteredPolicies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolicies.map((policy) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              onView={handleViewPolicy}
              onDelete={handleDeletePolicy}
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex items-center justify-center h-48">
          <p className="text-gray-500">
            {searchValue
              ? 'No policies found matching your search'
              : 'No policies found'}
          </p>
        </div>
      )}

      {/* Modals */}
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
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-2">Policy Overview</h3>
                <p className="text-gray-600">{selectedPolicy.name}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
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

              <div className="bg-gray-50 p-4 rounded-lg">
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
                <div className="bg-gray-50 p-4 rounded-lg">
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
