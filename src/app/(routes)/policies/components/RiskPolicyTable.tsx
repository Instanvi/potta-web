'use client';
import React, { useState, useMemo } from 'react';
import {
  MoreVertical,
  Eye,
  Trash2,
  Edit,
  ToggleLeft,
  ToggleRight,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import {
  useGetRiskPolicies,
  useDeleteRiskPolicy,
  useEnableRiskPolicy,
  useDisableRiskPolicy,
} from '../hooks/riskManagementHooks';
import {
  RiskPolicy,
  RiskCategory,
  RiskSeverity,
  TransactionType,
} from '../utils/risk-management-api';
import {
  RISK_CATEGORY_LABELS,
  RISK_SEVERITY_LABELS,
  RISK_SEVERITY_COLORS,
  TRANSACTION_TYPE_LABELS,
} from '../utils/risk-management-api';
import Search from '@potta/components/search';
import Button from '@potta/components/button';
// import { Icon } from '@iconify/react';
// import DataGrid from '../../../account_receivables/invoice/components/DataGrid';
// import { IColumnDef } from '../../../account_receivables/_utils/types';
// import { HeaderContext } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';

import toast from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@potta/components/card';
import { Badge } from '@potta/components/shadcn/badge';
import CreateRiskPolicyModal from './CreateRiskPolicyModal';
import ViewRiskPolicyModal from './ViewRiskPolicyModal';
import DeleteRiskPolicyModal from './DeleteRiskPolicyModal';
import moment from 'moment';

interface RiskPolicyTableProps {
  activeTab: string;
  activeSubmenu: string | null;
}

const RiskPolicyCard = ({
  policy,
  onView,
  onEdit,
  onDelete,
  onToggle,
}: {
  policy: RiskPolicy;
  onView: (policy: RiskPolicy) => void;
  onEdit: (policy: RiskPolicy) => void;
  onDelete: (policy: RiskPolicy) => void;
  onToggle: (policy: RiskPolicy) => void;
}) => {
  const getSeverityIcon = (severity: RiskSeverity) => {
    switch (severity) {
      case RiskSeverity.LOW:
        return <i className="ri-checkbox-circle-line text-green-600" />;
      case RiskSeverity.MEDIUM:
        return <i className="ri-alert-line text-yellow-600" />;
      case RiskSeverity.HIGH:
        return <i className="ri-error-warning-line text-orange-600" />;
      case RiskSeverity.CRITICAL:
        return <i className="ri-close-circle-line text-red-600" />;
      default:
        return <i className="ri-information-line text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: RiskCategory) => {
    switch (category) {
      case RiskCategory.INTERNAL:
        return <i className="ri-building-line text-blue-600" />;
      case RiskCategory.EXTERNAL:
        return <i className="ri-external-link-line text-purple-600" />;
      case RiskCategory.LIQUIDITY:
        return <i className="ri-money-dollar-circle-line text-green-600" />;

      default:
        return <i className="ri-shield-line text-gray-600" />;
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
              <Badge
                className={`${RISK_SEVERITY_COLORS[policy.severity]} text-xs`}
              >
                {getSeverityIcon(policy.severity)}
                <span className="ml-1">
                  {RISK_SEVERITY_LABELS[policy.severity]}
                </span>
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getCategoryIcon(policy.category)}
                <span className="ml-1">
                  {RISK_CATEGORY_LABELS[policy.category]}
                </span>
              </Badge>
              <Badge
                variant={policy.enabled ? 'default' : 'secondary'}
                className="text-xs"
              >
                {policy.enabled ? (
                  <>
                    <ToggleRight className="h-3 w-3 mr-1" />
                    Enabled
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-3 w-3 mr-1" />
                    Disabled
                  </>
                )}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* <Button variant="ghost" size="sm" className="h-8 w-8 p-0"> */}
              <MoreVertical className="h-4 w-4 cursor-pointer" />
              {/* </Button> */}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(policy)}>
                <Eye className="h-4 w-4 mr-2 cursor-pointer" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(policy)}>
                <Edit className="h-4 w-4 mr-2 cursor-pointer" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggle(policy)}>
                {policy.enabled ? (
                  <>
                    <ToggleLeft className="h-4 w-4 mr-2 cursor-pointer" />
                    Disable
                  </>
                ) : (
                  <>
                    <ToggleRight className="h-4 w-4 mr-2 cursor-pointer" />
                    Enable
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(policy)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Description */}
          <div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {policy.description}
            </p>
          </div>

          {/* Transaction Types */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Transaction Types
            </h4>
            <div className="flex flex-wrap gap-1">
              {policy.transactionTypes.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium bg-blue-100 text-blue-800"
                >
                  <i className="ri-file-list-line mr-1" />
                  {TRANSACTION_TYPE_LABELS[type]}
                </span>
              ))}
            </div>
          </div>

          {/* Rules Summary - Removed, will be shown in view modal */}

          {/* Created Date */}
          <div className="text-xs text-gray-500">
            Created: {moment(policy.createdAt).format('MMM DD, YYYY')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RiskPolicyTable: React.FC<RiskPolicyTableProps> = ({
  activeTab,
  activeSubmenu,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<RiskPolicy | null>(null);

  // Get risk policies data
  const { data, isLoading, error, refetch } = useGetRiskPolicies({
    search: searchValue || undefined,
    page: 1,
    limit: 50,
  });

  const deleteMutation = useDeleteRiskPolicy();
  const enableMutation = useEnableRiskPolicy();
  const disableMutation = useDisableRiskPolicy();

  const handleViewPolicy = (policy: RiskPolicy) => {
    setSelectedPolicy(policy);
    setIsViewModalOpen(true);
  };

  const handleEditPolicy = (policy: RiskPolicy) => {
    setSelectedPolicy(policy);
    setIsCreateModalOpen(true);
  };

  const handleDeletePolicy = (policy: RiskPolicy) => {
    setSelectedPolicy(policy);
    setIsDeleteModalOpen(true);
  };

  const handleTogglePolicy = async (policy: RiskPolicy) => {
    try {
      if (policy.enabled) {
        await disableMutation.mutateAsync(policy.uuid);
        toast.success('Policy disabled successfully');
      } else {
        await enableMutation.mutateAsync(policy.uuid);
        toast.success('Policy enabled successfully');
      }
      refetch();
    } catch (error) {
      toast.error(`Failed to ${policy.enabled ? 'disable' : 'enable'} policy`);
    }
  };

  const confirmDeletePolicy = async () => {
    if (!selectedPolicy) return;

    try {
      await deleteMutation.mutateAsync(selectedPolicy.uuid);
      toast.success('Policy deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedPolicy(null);
      refetch();
    } catch (error) {
      toast.error('Failed to delete policy');
    }
  };

  const handleCreatePolicy = () => {
    setSelectedPolicy(null);
    setIsCreateModalOpen(true);
  };

  const handleSavePolicy = () => {
    setIsCreateModalOpen(false);
    setSelectedPolicy(null);
    refetch();
  };

  // Filter policies based on active tab and submenu
  const filteredPolicies = useMemo(() => {
    if (!data?.data) return [];

    let filtered = data.data;

    // Filter by active tab
    if (activeTab !== 'all') {
      filtered = filtered.filter((policy: RiskPolicy) => {
        switch (activeTab) {
          case 'risk':
            return true; // All risk policies
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [data?.data, activeTab, activeSubmenu]);

  if (error) {
    return (
      <div className="mt-10">
        <div className="text-center text-gray-500 py-8">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
          <p className="text-red-600">
            An error occurred while fetching risk policies. Please try again
            later.
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
            placeholder="Search risk policies..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onClear={() => setSearchValue('')}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            text="Create Risk Policy"
            icon={<i className="ri-file-add-line"></i>}
            theme="default"
            type="button"
            onClick={handleCreatePolicy}
          />
        </div>
      </div>

      {/* Risk Policies Grid */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredPolicies.map((policy) => (
            <RiskPolicyCard
              key={policy.uuid}
              policy={policy}
              onView={handleViewPolicy}
              onEdit={handleEditPolicy}
              onDelete={handleDeletePolicy}
              onToggle={handleTogglePolicy}
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex items-center justify-center h-48">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">
              {searchValue
                ? 'No risk policies found matching your search'
                : 'No risk policies found'}
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateRiskPolicyModal
        open={isCreateModalOpen}
        setOpen={setIsCreateModalOpen}
        policy={selectedPolicy}
        onSave={handleSavePolicy}
      />

      <ViewRiskPolicyModal
        open={isViewModalOpen}
        setOpen={setIsViewModalOpen}
        policy={selectedPolicy}
      />

      <DeleteRiskPolicyModal
        open={isDeleteModalOpen}
        setOpen={setIsDeleteModalOpen}
        policy={selectedPolicy}
        onDelete={confirmDeletePolicy}
      />
    </div>
  );
};

export default RiskPolicyTable;
