'use client';
import React, { useEffect, useState } from 'react';
import Slider from '@potta/components/slideover';
import Text from '@potta/components/textDisplay';
import { useGetOneVoucher } from '../_hooks/hooks';

interface VoucherDetailsProps {
  voucherId: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const ViewVoucherSlider: React.FC<VoucherDetailsProps> = ({
  voucherId,
  open: controlledOpen,
  setOpen: setControlledOpen,
}) => {
  const { data, isLoading, error, refetch } = useGetOneVoucher(voucherId);

  // Local state as fallback if no controlled state is provided
  const [localOpen, setLocalOpen] = useState(false);

  // Determine which open state to use
  const isOpen = controlledOpen ?? localOpen;
  const setIsOpen = setControlledOpen ?? setLocalOpen;

  useEffect(() => {
    if (isOpen && voucherId) {
      refetch();
    }
  }, [voucherId, refetch, isOpen]);

  // Format date for better readability
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Helper to render type-specific details
  const renderVoucherTypeDetails = (data:any) => {
    switch (data.type) {
      case 'giftcard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Text name="Balance" value={data.balance || 'N/A'} height={false} />
          </div>
        );
      case 'discount':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.discountAmount && (
              <Text name="Discount Amount" value={data.discountAmount} height={false} />
            )}
            {data.discountPercent && (
              <Text name="Discount Percentage" value={`${data.discountPercent}%`} height={false} />
            )}
            {data.maximumDiscount && (
              <Text name="Maximum Discount" value={data.maximumDiscount} height={false} />
            )}
          </div>
        );
      case 'cashback':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.cashbackAmount && (
              <Text name="Cashback Amount" value={data.cashbackAmount} height={false} />
            )}
            {data.cashbackPercent && (
              <Text name="Cashback Percentage" value={`${data.cashbackPercent}%`} height={false} />
            )}
            {data.cashbackMaximum && (
              <Text name="Maximum Cashback" value={data.cashbackMaximum} height={false} />
            )}
          </div>
        );
      case 'loyalty':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Text name="Loyalty Points" value={data.loyaltyPoints || 'N/A'} height={false} />
            <Text name="Loyalty Amount" value={data.loyaltyAmount || 'N/A'} height={false} />
            <Text name="Conversion Rate" value={data.conversionRate || 'N/A'} height={false} />
            <Text name="Points Required" value={data.pointsRequired || 'N/A'} height={false} />
          </div>
        );
      default:
        return <Text name="Details" value="No type-specific details available" height={false} />;
    }
  };

  return (
    <Slider
      open={isOpen}
      setOpen={setIsOpen}
      edit={false}
      title="Voucher Details"
      buttonText="View Voucher"
    >
      {isLoading && (
        <div className="flex justify-center items-center py-10 h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}

      {error && (
        <div className="p-6 bg-red-50 rounded-md">
          <p className="text-red-600 text-center font-medium">
            Error fetching voucher details: {error.message}
          </p>
        </div>
      )}

      {!isLoading && !error && !data && (
        <div className="p-6 text-center">
          <p className="text-gray-500">No voucher data available.</p>
        </div>
      )}

      {data && (
        <div className="relative w-full max-w-4xl p-6 overflow-y-auto">
          <div className="space-y-8">
            {/* Voucher Header */}
            <div className="border-b pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-medium text-gray-800">{data.name || 'Unnamed Voucher'}</h2>
                  <p className="text-sm text-gray-500 mt-1">ID: {data.id}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  data.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {data.active ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-700">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Text 
                  name="Type" 
                  value={data.type ? data.type.charAt(0).toUpperCase() + data.type.slice(1) : 'N/A'} 
                  height={false} 
                />
                <Text 
                  name="Code" 
                  value={data.code || 'N/A'} 
                  height={false} 
                />
                <Text 
                  name="Usage Limit" 
                  value={data.usageLimit ? data.usageLimit.toString() : 'Unlimited'} 
                  height={false} 
                />
                {data.minimumPurchase && (
                  <Text 
                    name="Minimum Purchase" 
                    value={data.minimumPurchase} 
                    height={false} 
                  />
                )}
              </div>
            </div>

            {/* Type-specific details */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-700">
                {data.type ? `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} Details` : 'Voucher Details'}
              </h3>
              {renderVoucherTypeDetails(data)}
            </div>

            {/* Validity Information */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-700">Validity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.programStartDate && (
                  <Text 
                    name="Start Date" 
                    value={formatDate(data.programStartDate)} 
                    height={false} 
                  />
                )}
                {data.expiryDate && (
                  <Text 
                    name="Expiry Date" 
                    value={formatDate(data.expiryDate)} 
                    height={false} 
                  />
                )}
                {data.programEndDate && (
                  <Text 
                    name="End Date" 
                    value={formatDate(data.programEndDate)} 
                    height={false} 
                  />
                )}
                {data.neverEnds !== undefined && (
                  <Text 
                    name="Never Expires" 
                    value={data.neverEnds ? 'Yes' : 'No'} 
                    height={false} 
                  />
                )}
                {data.validDays && (
                  <Text 
                    name="Valid Days" 
                    value={Array.isArray(data.validDays) ? data.validDays.join(', ') : data.validDays} 
                    height={false} 
                  />
                )}
              </div>
            </div>

            {/* Audience Information */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-700">Audience</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.audienceSegment && (
                  <Text 
                    name="Audience Segment" 
                    value={data.audienceSegment} 
                    height={false} 
                  />
                )}
                {data.autoAddUsers !== undefined && (
                  <Text 
                    name="Auto-add Users" 
                    value={data.autoAddUsers ? 'Yes' : 'No'} 
                    height={false} 
                  />
                )}
                {data.canJoinOnce !== undefined && (
                  <Text 
                    name="Can Join Once" 
                    value={data.canJoinOnce ? 'Yes' : 'No'} 
                    height={false} 
                  />
                )}
                {data.maxEntries && (
                  <Text 
                    name="Maximum Entries" 
                    value={data.maxEntries} 
                    height={false} 
                  />
                )}
                {data.programCardPrefix && (
                  <Text 
                    name="Program Card Prefix" 
                    value={data.programCardPrefix} 
                    height={false} 
                  />
                )}
              </div>
            </div>

            {/* Code Settings */}
            {data.codeSettings && (
              <div>
                <h3 className="text-lg font-medium mb-4 text-gray-700">Code Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.codeSettings.prefix && (
                    <Text 
                      name="Prefix" 
                      value={data.codeSettings.prefix} 
                      height={false} 
                    />
                  )}
                  {data.codeSettings.postfix && (
                    <Text 
                      name="Postfix" 
                      value={data.codeSettings.postfix} 
                      height={false} 
                    />
                  )}
                  {data.codeSettings.length && (
                    <Text 
                      name="Length" 
                      value={data.codeSettings.length} 
                      height={false} 
                    />
                  )}
                  {data.codeSettings.pattern && (
                    <Text 
                      name="Pattern" 
                      value={data.codeSettings.pattern} 
                      height={false} 
                    />
                  )}
                  {data.codeSettings.characterSet && (
                    <Text 
                      name="Character Set" 
                      value={data.codeSettings.characterSet} 
                      height={false} 
                    />
                  )}
                </div>
              </div>
            )}

            {/* Creation and Modification Info */}
            <div className="border-t pt-6 mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.createdAt && (
                  <Text 
                    name="Created" 
                    value={formatDate(data.createdAt)} 
                    height={false} 
                  />
                )}
                {data.updatedAt && (
                  <Text 
                    name="Last Modified" 
                    value={formatDate(data.updatedAt)} 
                    height={false} 
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Slider>
  );
};

export default ViewVoucherSlider;
