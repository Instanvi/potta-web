'use client';
import React, { useEffect } from 'react';
import Slider from '@potta/components/slideover';
import { Badge } from '@potta/components/shadcn/badge';
import { Package, Calendar, DollarSign, User, FileText } from 'lucide-react';
import { Skeleton } from '@potta/components/shadcn/skeleton';
import type { SpendRequest, RFQ } from '../utils/types';
import { useGetSpendRequest, useGetRFQ } from '../hooks/useProcurement';
import ThreadPanel from '@potta/components/threads/ThreadPanel';

interface ViewDetailsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  itemId: string | null;
  type: 'SPEND_REQUEST' | 'RFQ';
  getVendorName: (vendorId?: string) => string;
  getUserName: (userId?: string) => string;
}

const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({
  open,
  setOpen,
  itemId,
  type,
  getVendorName,
  getUserName,
}) => {
  // Fetch detailed data by ID
  // Only fetch the appropriate type based on the type prop
  const shouldFetchSpendRequest = type === 'SPEND_REQUEST' && !!itemId;
  const shouldFetchRFQ = type === 'RFQ' && !!itemId;

  const {
    data: spendRequestData,
    isLoading: loadingSpendRequest,
    refetch: refetchSpendRequest,
  } = useGetSpendRequest(shouldFetchSpendRequest ? itemId! : '');

  const {
    data: rfqData,
    isLoading: loadingRFQ,
    refetch: refetchRFQ,
  } = useGetRFQ(shouldFetchRFQ ? itemId! : '');

  // Refetch when modal opens
  useEffect(() => {
    if (open && itemId) {
      if (type === 'SPEND_REQUEST') {
        refetchSpendRequest();
      } else {
        refetchRFQ();
      }
    }
  }, [open, itemId, type, refetchSpendRequest, refetchRFQ]);

  const item = type === 'SPEND_REQUEST' ? spendRequestData : rfqData;
  const isLoading = type === 'SPEND_REQUEST' ? loadingSpendRequest : loadingRFQ;

  if (!open) return null;

  if (isLoading) {
    return (
      <Slider
        open={open}
        setOpen={setOpen}
        title={
          type === 'SPEND_REQUEST' ? 'Spend Request Details' : 'RFQ Details'
        }
        edit={false}
        closeButton={false}
      >
        <div className="w-full max-w-4xl space-y-6">
          <div className="bg-white border border-gray-200 p-6">
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/4 mb-4" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="bg-white border border-gray-200 p-6">
            <Skeleton className="h-6 w-1/3 mb-4" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </Slider>
    );
  }

  if (!item) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending_approval':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'sent':
      case 'responses_received':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return (
      status
        ?.replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase()) || 'Draft'
    );
  };

  return (
    <Slider
      open={open}
      setOpen={setOpen}
      title={type === 'SPEND_REQUEST' ? 'Spend Request Details' : 'RFQ Details'}
      edit={false}
      closeButton={false}
    >
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-medium text-gray-900 mb-2">
                {item.title}
              </h2>
              <p className="text-sm text-gray-500">
                {type === 'SPEND_REQUEST'
                  ? (item as SpendRequest).requestNumber
                  : (item as RFQ).rfqNumber}
              </p>
            </div>
            <Badge
              className={`${getStatusColor(
                item.status || 'DRAFT'
              )} font-medium px-4 py-2`}
            >
              {formatStatus(item.status || 'DRAFT')}
            </Badge>
          </div>

          <p className="text-gray-600">{item.description}</p>
        </div>

        {/* Spend Request Specific Details */}
        {type === 'SPEND_REQUEST' && (
          <div className="bg-white border border-gray-200 p-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Request Information
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Requested Amount</span>
                </div>
                <p className="text-xl font-medium text-green-900">
                  {formatCurrency((item as SpendRequest).requestedAmount || 0)}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Required Date</span>
                </div>
                <p className="text-lg font-medium text-gray-900">
                  {formatDate((item as SpendRequest).requiredDate)}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <FileText className="w-4 h-4" />
                  <span>Priority</span>
                </div>
                <p className="text-lg font-medium text-gray-900">
                  {(item as SpendRequest).priority}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <User className="w-4 h-4" />
                  <span>Requested By</span>
                </div>
                <p className="text-lg font-medium text-gray-900">
                  {getUserName((item as SpendRequest).requestedBy)}
                </p>
              </div>
            </div>

            {(item as SpendRequest).justification && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-1">Justification</p>
                <p className="text-gray-900">
                  {(item as SpendRequest).justification}
                </p>
              </div>
            )}

            {(item as SpendRequest).comments && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-1">Comments</p>
                <p className="text-gray-900">
                  {(item as SpendRequest).comments}
                </p>
              </div>
            )}
          </div>
        )}

        {/* RFQ Specific Details */}
        {type === 'RFQ' && (
          <div className="bg-white border border-gray-200 p-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              RFQ Information
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Deadline</span>
                </div>
                <p className="text-lg font-medium text-gray-900">
                  {formatDate((item as RFQ).deadline)}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <User className="w-4 h-4" />
                  <span>Vendors</span>
                </div>
                <p className="text-lg font-medium text-gray-900">
                  {(item as RFQ).vendorList?.length || 0} vendors invited
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Sent At</span>
                </div>
                <p className="text-lg font-medium text-gray-900">
                  {formatDate((item as RFQ).sentAt)}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Delivery Date</span>
                </div>
                <p className="text-lg font-medium text-gray-900">
                  {formatDate((item as RFQ).requirements?.deliveryDate)}
                </p>
              </div>
            </div>

            {(item as RFQ).requirements?.deliveryLocation && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-1">Delivery Location</p>
                <p className="text-gray-900">
                  {(item as RFQ).requirements.deliveryLocation}
                </p>
              </div>
            )}

            {(item as RFQ).instructions && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-1">Instructions</p>
                <p className="text-gray-900">{(item as RFQ).instructions}</p>
              </div>
            )}

            {(item as RFQ).requirements?.paymentTerms && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-1">Payment Terms</p>
                <p className="text-gray-900">
                  {(item as RFQ).requirements.paymentTerms}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Items List */}
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Items
          </h3>

          <div className="space-y-3">
            {type === 'SPEND_REQUEST' &&
              (item as SpendRequest).items?.map((lineItem, index) => (
                <div
                  key={lineItem.id}
                  className="border border-gray-200 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {index + 1}. {lineItem.description}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {lineItem.category}
                      </p>
                    </div>
                    <span className="font-medium text-green-900">
                      {formatCurrency(lineItem.totalAmount)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                    <div>
                      <span className="text-gray-500">Quantity:</span>
                      <span className="ml-1 font-medium">
                        {lineItem.quantity}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Unit Price:</span>
                      <span className="ml-1 font-medium">
                        {formatCurrency(lineItem.unitPrice)}
                      </span>
                    </div>
                    {lineItem.vendorId && (
                      <div>
                        <span className="text-gray-500">Vendor:</span>
                        <span className="ml-1 font-medium">
                          {getVendorName(lineItem.vendorId)}
                        </span>
                      </div>
                    )}
                  </div>

                  {lineItem.specifications && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-500 mb-1">
                        Specifications
                      </p>
                      <p className="text-sm text-gray-700">
                        {lineItem.specifications}
                      </p>
                    </div>
                  )}
                </div>
              ))}

            {type === 'RFQ' &&
              (item as RFQ).requirements?.items?.map((lineItem, index) => (
                <div
                  key={index}
                  className="border border-gray-200 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {index + 1}. {lineItem.description}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {lineItem.category}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                    <div>
                      <span className="text-gray-500">Quantity:</span>
                      <span className="ml-1 font-medium">
                        {lineItem.quantity} {lineItem.unit}
                      </span>
                    </div>
                  </div>

                  {lineItem.specifications && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-500 mb-1">
                        Specifications
                      </p>
                      <p className="text-sm text-gray-700">
                        {lineItem.specifications}
                      </p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Approval History (if available for Spend Requests) */}
        {type === 'SPEND_REQUEST' && (
          <div className="bg-white border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Approval Information
            </h3>

            <div className="space-y-3 text-sm">
              {(item as SpendRequest).approvedBy && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Approved By:</span>
                  <span className="font-medium text-gray-900">
                    {getUserName((item as SpendRequest).approvedBy)}
                  </span>
                </div>
              )}

              {(item as SpendRequest).approvedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Approved At:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate((item as SpendRequest).approvedAt)}
                  </span>
                </div>
              )}

              {(item as SpendRequest).rejectedBy && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Rejected By:</span>
                  <span className="font-medium text-red-600">
                    {getUserName((item as SpendRequest).rejectedBy)}
                  </span>
                </div>
              )}

              {(item as SpendRequest).rejectionReason && (
                <div className="pt-3 border-t">
                  <p className="text-gray-500 mb-1">Rejection Reason:</p>
                  <p className="text-red-600">
                    {(item as SpendRequest).rejectionReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vendor List (for RFQs) */}
        {type === 'RFQ' &&
          (item as RFQ).vendorList &&
          (item as RFQ).vendorList!.length > 0 && (
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Invited Vendors
              </h3>

              <div className="space-y-2">
                {(item as RFQ).vendorList?.map((vendorId, index) => (
                  <div
                    key={vendorId}
                    className="flex items-center gap-3 p-3 bg-gray-50"
                  >
                    <span className="w-6 h-6 bg-green-100 text-green-700 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-gray-900 font-medium">
                      {getVendorName(vendorId)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Timestamps */}
        <div className="bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Created:</span>
              <span className="ml-2 font-medium text-gray-900">
                {formatDate(item.createdAt)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Last Updated:</span>
              <span className="ml-2 font-medium text-gray-900">
                {formatDate(item.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        {type === 'SPEND_REQUEST' && (item as SpendRequest)?.uuid && (
          <ThreadPanel
            entityType="SPEND_REQUEST"
            entityId={
              (item as SpendRequest).uuid || (item as SpendRequest).id || ''
            }
            entityDisplayName={`Spend Request #${
              (item as SpendRequest).requestNumber ||
              (item as SpendRequest).title
            }`}
            emptyStateMessage="No conversations for this spend request yet."
          />
        )}
      </div>
    </Slider>
  );
};

export default ViewDetailsModal;
