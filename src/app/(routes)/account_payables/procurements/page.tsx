'use client';
import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import RootLayout from '../../layout';
import { Badge } from '@potta/components/shadcn/badge';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
import DynamicFilter from '@potta/components/dynamic-filter';
import ProcurementActionSidebar from './components/ProcurementActionSidebar';
import Button from '@potta/components/button';
import {
  ShoppingCart,
  FileText,
  Package,
  MoreVertical,
} from 'lucide-react';
import { ContextData } from '@potta/components/providers/DataProvider';
import { useCallback } from 'react';
import {
  useGetSpendRequests,
  useGetRFQs,
  useSubmitSpendRequest,
  useApproveSpendRequest,
  useRejectSpendRequest,
  useCreateRFQ,
  useSendRFQ,
  useCloseRFQ,
} from './hooks/useProcurement';
import type { SpendRequest, RFQ, SpendRequestPriority } from './utils/types';
import NewSpendRequestSlideover from './components/NewSpendRequestSlideover';
import CreateRFQModal from './components/CreateRFQModal';
import ViewDetailsModal from './components/ViewDetailsModal';
import SendRFQModal from './components/SendRFQModal';
import useGetAllVendors from '../../vendors/hooks/useGetAllVendors';
import { useEmployees } from '../spend-program/hooks/useEmployees';
import moment from 'moment';

// Combined item type for display
export interface ProcurementItem {
  id: string;
  name: string;
  type: 'SPEND_REQUEST' | 'RFQ';
  description: string;
  status: string;
  vendor: string;
  amount: number;
  items: number;
  priority?: SpendRequestPriority;
  requestNumber?: string;
  rfqNumber?: string;
  deadline?: string;
  createdAt?: string;
  spendRequestId?: string; // Parent spend request ID for RFQs
}

// Helper function to get icon based on type
const getItemIcon = (type: string) => {
  switch (type) {
    case 'SPEND_REQUEST':
      return <ShoppingCart className="w-5 h-5 text-green-600" />;
    case 'RFQ':
      return <FileText className="w-5 h-5 text-blue-600" />;
    default:
      return <FileText className="w-5 h-5 text-gray-600" />;
  }
};

// Helper function to get status color
const getStatusColor = (status: string) => {
  const statusLower = status?.toLowerCase();
  switch (statusLower) {
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending_approval':
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'draft':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'sent':
    case 'responses_received':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'closed':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Helper to format status text
const formatStatus = (status: string) => {
  return (
    status
      ?.replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase()) || 'Draft'
  );
};

// Helper to format date
const formatDate = (date: string) => {
  if (!date) return 'N/A';
  const momentDate = moment(date);
  const today = moment();

  if (momentDate.isSame(today, 'day')) {
    return 'Today';
  } else if (momentDate.isSame(today.clone().subtract(1, 'day'), 'day')) {
    return 'Yesterday';
  } else if (momentDate.isAfter(today.clone().subtract(7, 'days'))) {
    return momentDate.format('dddd');
  } else {
    return momentDate.format('MMM DD, YYYY');
  }
};

const ProcurementsPage = () => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [slideoverOpen, setSlideoverOpen] = useState(false);
  const [rfqModalOpen, setRfqModalOpen] = useState(false);
  const [selectedSpendRequestId, setSelectedSpendRequestId] = useState<
    string | null
  >(null);
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<
    'SPEND_REQUEST' | 'RFQ'
  >('SPEND_REQUEST');
  const [sendRFQModalOpen, setSendRFQModalOpen] = useState(false);
  const [selectedRFQId, setSelectedRFQId] = useState<string | null>(null);
  const [actionSidebarOpen, setActionSidebarOpen] = useState(false);
  const [selectedItemForAction, setSelectedItemForAction] =
    useState<ProcurementItem | null>(null);
  const context = React.useContext(ContextData);

  // Mutations for actions
  const submitMutation = useSubmitSpendRequest();
  const approveMutation = useApproveSpendRequest();
  const rejectMutation = useRejectSpendRequest();
  const createRFQMutation = useCreateRFQ();
  const sendRFQMutation = useSendRFQ();
  const closeRFQMutation = useCloseRFQ();

  // Fetch spend requests
  const {
    data: spendRequests = [],
    isLoading: loadingSpendRequests,
    isError: errorSpendRequests,
    refetch: refetchSpendRequests,
  } = useGetSpendRequests();

  // Fetch RFQs
  const {
    data: rfqs = [],
    isLoading: loadingRFQs,
    isError: errorRFQs,
    refetch: refetchRFQs,
  } = useGetRFQs();

  // Fetch vendors to map UUIDs to names
  const { data: vendorsData } = useGetAllVendors({
    page: 1,
    limit: 200,
  });

  const vendors = vendorsData?.data || [];

  // Fetch employees/users to map UUIDs to names
  const { data: employees = [] } = useEmployees();

  const isLoading = loadingSpendRequests || loadingRFQs;
  const isError = errorSpendRequests || errorRFQs;

  // Helper function to get vendor name by UUID
  const getVendorName = useCallback(
    (vendorId?: string) => {
      if (!vendorId) return 'No vendor';
      const vendor = vendors.find(
        (v: any) => v.uuid === vendorId || v.id === vendorId
      );
      return vendor?.name || 'Unknown vendor';
    },
    [vendors]
  );

  // Helper function to get user name by UUID
  const getUserName = useCallback(
    (userId?: string) => {
      if (!userId) return 'N/A';
      const employee = employees.find(
        (e: any) => e.uuid === userId || e.id === userId
      );
      if (employee) {
        return (
          `${employee.firstName} ${employee.lastName}`.trim() || employee.email
        );
      }
      return 'Unknown user';
    },
    [employees]
  );

  // Combine and transform data
  // Filter out spend requests that already have an RFQ to avoid duplicates
  const allItems = useMemo(() => {
    // Create a set of spend request IDs that have RFQs
    const spendRequestIdsWithRFQ = new Set(
      (rfqs || [])
        .map((rfq: RFQ) => rfq.spendRequestId)
        .filter((id): id is string => !!id)
    );

    const spendRequestItems: ProcurementItem[] = (spendRequests || [])
      // Filter out spend requests that have an associated RFQ
      .filter((sr: SpendRequest) => {
        const srId = sr.uuid || sr.id;
        return !srId || !spendRequestIdsWithRFQ.has(srId);
      })
      .map((sr: SpendRequest) => ({
        id: sr.uuid || sr.id || '',
        name: sr.title,
        type: 'SPEND_REQUEST' as const,
        description: sr.description,
        status: sr.status || 'DRAFT',
        vendor: getVendorName(sr.items?.[0]?.vendorId),
        amount: parseFloat(sr.requestedAmount?.toString() || '0'),
        items: sr.items?.length || 0,
        priority: sr.priority,
        requestNumber: sr.requestNumber,
        createdAt: sr.createdAt,
      }));

    const rfqItems: ProcurementItem[] = (rfqs || []).map((rfq: RFQ) => ({
      id: rfq.uuid || rfq.id || '',
      name: rfq.title,
      type: 'RFQ' as const,
      description: rfq.description,
      status: rfq.status || 'DRAFT',
      vendor: rfq.vendorList?.length
        ? `${rfq.vendorList.length} vendors`
        : 'No vendors',
      amount: 0, // RFQs don't have amount until responses come
      items: rfq.requirements?.items?.length || 0,
      rfqNumber: rfq.rfqNumber,
      deadline: rfq.deadline,
      createdAt: rfq.createdAt,
      spendRequestId: rfq.spendRequestId, // Store the parent spend request ID
    }));

    return [...spendRequestItems, ...rfqItems];
  }, [spendRequests, rfqs, getVendorName]);

  // Filter items based on search and active filter
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.vendor?.toLowerCase().includes(search.toLowerCase()) ||
        item.requestNumber?.toLowerCase().includes(search.toLowerCase()) ||
        item.rfqNumber?.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        activeFilter === 'all' || item.type === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [allItems, search, activeFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle actions
  const handleSubmit = async (id: string) => {
    await submitMutation.mutateAsync(id);
  };

  const handleApprove = async (id: string) => {
    await approveMutation.mutateAsync({ id, data: { comments: 'Approved' } });
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      await rejectMutation.mutateAsync({
        id,
        data: { rejectionReason: reason },
      });
    }
  };

  const handleCreateRFQ = async (itemId: string) => {
    setSelectedSpendRequestId(itemId);
    setRfqModalOpen(true);
  };

  const handleSendRFQ = async (id: string) => {
    setSelectedRFQId(id);
    setSendRFQModalOpen(true);
  };

  const handleCloseRFQ = async (id: string) => {
    const reason = prompt('Enter reason for closing:');
    if (reason) {
      await closeRFQMutation.mutateAsync({ id, data: { reason } });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchClear = () => {
    setSearch('');
  };

  // Filter configuration
  const filterConfig = [
    {
      key: 'type',
      label: 'Type',
      options: [
        { label: 'All Items', value: 'all' },
        { label: 'Spend Requests', value: 'SPEND_REQUEST' },
        { label: 'RFQs', value: 'RFQ' },
      ],
      value: activeFilter,
      onChange: setActiveFilter,
      selectClassName: 'min-w-[140px]',
    },
  ];

  // Table columns definition
  const columns: ColumnDef<ProcurementItem>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row: { original } }) => (
        <div className="text-sm text-gray-600">
          {formatDate(original.createdAt || '')}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row: { original } }) => (
        <div className="flex items-center gap-2">
          {getItemIcon(original.type)}
          <span className="text-sm font-medium">
            {original.type === 'SPEND_REQUEST' ? 'Spend Request' : 'RFQ'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'requestNumber',
      header: 'Number',
      cell: ({ row: { original } }) => (
        <div className="text-sm text-gray-900">
          {original.requestNumber || original.rfqNumber || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Title',
      cell: ({ row: { original } }) => (
        <div className="text-sm font-medium">{original.name}</div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row: { original } }) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {original.description || 'No description'}
        </div>
      ),
    },
    {
      accessorKey: 'vendor',
      header: 'Vendor',
      cell: ({ row: { original } }) => (
        <div className="text-sm">{original.vendor}</div>
      ),
    },
    {
      accessorKey: 'items',
      header: 'Items',
      cell: ({ row: { original } }) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Package className="w-4 h-4" />
          {original.items}
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row: { original } }) => (
        <div className="text-sm font-medium">
          {original.amount > 0 ? formatCurrency(original.amount) : '-'}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row: { original } }) => (
        <Badge
          className={`${getStatusColor(
            original.status
          )} font-medium px-3 py-1 text-xs border`}
        >
          {formatStatus(original.status)}
        </Badge>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row: { original } }) => (
        <div>
          {original.priority ? (
            <span
              className={`text-xs px-2 py-1 border ${
                original.priority === 'URGENT'
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : original.priority === 'HIGH'
                  ? 'bg-orange-100 text-orange-800 border-orange-200'
                  : original.priority === 'MEDIUM'
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  : 'bg-gray-100 text-gray-800 border-gray-200'
              }`}
            >
              {original.priority}
            </span>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row: { original } }) => {
        return (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedItemForAction(original);
                setActionSidebarOpen(true);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <RootLayout>
      <div
        className={`${
          context?.layoutMode === 'sidebar' ? 'pl-16' : 'pl-5'
        } pr-5 pt-2`}
      >
        <div className="flex justify-between items-center w-full mb-6">
          {/* Left side - Dynamic Filter */}
          <div className="flex-1">
            <DynamicFilter
              searchValue={search}
              onSearchChange={handleSearchChange}
              onSearchClear={handleSearchClear}
              searchPlaceholder="Search procurement items by title, description, number..."
              filters={filterConfig}
              className="p-0 bg-transparent"
            />
          </div>

          {/* Right side - Action Buttons */}
          <div className="flex items-center space-x-2 ml-4">
            <Button
              text="New Spend Request"
              type="button"
              onClick={() => setSlideoverOpen(true)}
            />
          </div>
        </div>

        {/* DataGrid Table */}
        <DataGrid
          columns={columns}
          data={filteredItems}
          isLoading={isLoading}
        />

        {/* New Spend Request Slideover */}
        <NewSpendRequestSlideover
          open={slideoverOpen}
          setOpen={setSlideoverOpen}
          onCreated={() => {
            refetchSpendRequests();
          }}
        />

        {/* Create RFQ Modal */}
        <CreateRFQModal
          open={rfqModalOpen}
          setOpen={setRfqModalOpen}
          spendRequestId={selectedSpendRequestId}
          onCreated={() => {
            refetchSpendRequests();
          }}
        />

        {/* View Details Modal */}
        <ViewDetailsModal
          open={viewDetailsModalOpen}
          setOpen={setViewDetailsModalOpen}
          itemId={selectedItemId}
          type={selectedItemType}
          getVendorName={getVendorName}
          getUserName={getUserName}
        />

        {/* Send RFQ Modal */}
        <SendRFQModal
          open={sendRFQModalOpen}
          setOpen={setSendRFQModalOpen}
          rfqId={selectedRFQId}
          onSent={() => {
            refetchRFQs();
          }}
        />

        {/* Action Sidebar */}
        <ProcurementActionSidebar
          open={actionSidebarOpen}
          setOpen={setActionSidebarOpen}
          item={selectedItemForAction}
          onViewDetails={() => {
            if (selectedItemForAction) {
              setSelectedItemId(selectedItemForAction.id);
              setSelectedItemType(selectedItemForAction.type);
              setViewDetailsModalOpen(true);
            }
          }}
          onSubmit={handleSubmit}
          onApprove={handleApprove}
          onReject={handleReject}
          onCreateRFQ={handleCreateRFQ}
          onSendRFQ={handleSendRFQ}
          onCloseRFQ={handleCloseRFQ}
        />
      </div>
    </RootLayout>
  );
};

export default ProcurementsPage;
