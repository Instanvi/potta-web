'use client';
import React, { useContext, useEffect, useState } from 'react';
import Slider from '@potta/components/slideover';
import Button from '@potta/components/button';
import { ContextData } from '@potta/components/providers/DataProvider';
import useGetOneVendor from '../hooks/useGetOneVendor';
import { PhoneFlag } from './table';
import { Badge } from '@potta/components/shadcn/badge';
import {
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building,
  CreditCard,
  DollarSign,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  Banknote,
  Tag,
} from 'lucide-react';

interface VendorDetailsProps {
  vendorId: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  onVendorDataChange?: () => void; // Callback to refresh vendor data
}

const ViewVendorSlider: React.FC<VendorDetailsProps> = ({
  vendorId,
  open: controlledOpen,
  setOpen: setControlledOpen,
  onVendorDataChange,
}) => {
  const context = useContext(ContextData);
  const { data, isLoading, error, refetch } = useGetOneVendor(vendorId);

  // Local state as fallback if no controlled state is provided
  const [localOpen, setLocalOpen] = useState(false);

  // Determine which open state to use
  const isOpen = controlledOpen ?? localOpen;
  const setIsOpen = setControlledOpen ?? setLocalOpen;

  useEffect(() => {
    if (isOpen && vendorId) {
      refetch();
    }
  }, [vendorId, refetch, isOpen]);

  // Refresh data when callback is triggered
  useEffect(() => {
    if (onVendorDataChange && isOpen && vendorId) {
      refetch();
    }
  }, [onVendorDataChange, isOpen, vendorId, refetch]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: <Clock className="h-3 w-3" />,
      },
      APPROVED: {
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-3 w-3" />,
      },
      REJECTED: {
        color: 'bg-red-100 text-red-800',
        icon: <XCircle className="h-3 w-3" />,
      },
      ACTIVE: {
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-3 w-3" />,
      },
      INACTIVE: {
        color: 'bg-gray-100 text-gray-800',
        icon: <XCircle className="h-3 w-3" />,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <Badge className={`${config.color} w-fit flex items-center gap-1`}>
        {config.icon}
        {status}
      </Badge>
    );
  };

  const getKYCStatusBadge = (isKYCVerified: boolean) => {
    return isKYCVerified ? (
      <Badge className="bg-green-100 text-green-800 w-fit flex items-center gap-1">
        <Shield className="h-3 w-3" />
        Verified
      </Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800 w-fit flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  };

  const formatCurrency = (
    amount: number | string,
    currency: string = 'XAF'
  ) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 'N/A';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const InfoCard = ({
    title,
    children,
    icon,
  }: {
    title: string;
    children: React.ReactNode;
    icon: React.ReactNode;
  }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">{icon}</div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  const InfoField = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string | number | React.ReactNode;
    icon?: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-2">
        {icon && <div className="text-gray-400">{icon}</div>}
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="text-sm text-gray-900 font-medium">{value || 'N/A'}</div>
    </div>
  );

  return (
    <Slider
      open={isOpen}
      setOpen={setIsOpen}
      edit={false}
      title="Vendor Details"
    >
      <div className="w-full max-w-7xl mx-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">
              Loading vendor details...
            </span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">
              Error fetching vendor details: {error.message}
            </p>
          </div>
        )}

        {data && (
          <>
            {/* Header Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <Building className="h-8 w-8 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-medium text-gray-900">
                      {data.name}
                    </h2>
                    <p className="text-gray-600 capitalize">{data.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(data.status)}
                  {getKYCStatusBadge(data.isKYCVerified)}
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Basic Information */}
                <InfoCard
                  title="Basic Information"
                  icon={<User className="h-5 w-5" />}
                >
                  <div className="space-y-1">
                    <InfoField
                      label="Contact Person"
                      value={data.contactPerson}
                      icon={<User className="h-4 w-4" />}
                    />
                    <InfoField
                      label="Email"
                      value={data.email}
                      icon={<Mail className="h-4 w-4" />}
                    />
                    <InfoField
                      label="Phone"
                      value={
                        data.phone ? <PhoneFlag phoneNumber={data.phone} /> : 'N/A'
                      }
                      icon={<Phone className="h-4 w-4" />}
                    />
                    <InfoField
                      label="Website"
                      value={
                        data.website ? (
                          <a
                            href={data.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {data.website}
                          </a>
                        ) : (
                          'N/A'
                        )
                      }
                      icon={<Globe className="h-4 w-4" />}
                    />
                    <InfoField
                      label="Industry"
                      value={data.industry}
                      icon={<Tag className="h-4 w-4" />}
                    />
                    <InfoField
                      label="Classification"
                      value={data.classification}
                      icon={<Building className="h-4 w-4" />}
                    />
                  </div>
                </InfoCard>

                {/* Financial Information */}
                <InfoCard
                  title="Financial Information"
                  icon={<DollarSign className="h-5 w-5" />}
                >
                  <div className="space-y-1">
                    <InfoField
                      label="Opening Balance"
                      value={formatCurrency(
                        data.openingBalance || 0,
                        data.currency
                      )}
                      icon={<Banknote className="h-4 w-4" />}
                    />
                    <InfoField
                      label="Currency"
                      value={data.currency}
                      icon={<DollarSign className="h-4 w-4" />}
                    />
                    <InfoField
                      label="Credit Limit"
                      value={
                        data.creditLimit
                          ? formatCurrency(data.creditLimit, data.currency)
                          : 'N/A'
                      }
                      icon={<CreditCard className="h-4 w-4" />}
                    />
                    <InfoField
                      label="Payment Terms"
                      value={data.paymentTerms}
                      icon={<FileText className="h-4 w-4" />}
                    />
                    <InfoField
                      label="Account Details"
                      value={data.accountDetails}
                      icon={<Banknote className="h-4 w-4" />}
                    />
                  </div>
                </InfoCard>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Address Information */}
                <InfoCard
                  title="Address Information"
                  icon={<MapPin className="h-5 w-5" />}
                >
                  <div className="space-y-1">
                    <InfoField
                      label="Address"
                      value={data.address?.address}
                      icon={<MapPin className="h-4 w-4" />}
                    />
                    <InfoField
                      label="City"
                      value={data.address?.city}
                      icon={<MapPin className="h-4 w-4" />}
                    />
                    <InfoField
                      label="State"
                      value={data.address?.state}
                      icon={<MapPin className="h-4 w-4" />}
                    />
                    <InfoField
                      label="Country"
                      value={data.address?.country}
                      icon={<MapPin className="h-4 w-4" />}
                    />
                    <InfoField
                      label="Postal Code"
                      value={data.address?.postalCode}
                      icon={<MapPin className="h-4 w-4" />}
                    />
                    {(data.address?.latitude || data.address?.longitude) && (
                      <InfoField
                        label="Coordinates"
                        value={`${data.address?.latitude || 'N/A'}, ${
                          data.address?.longitude || 'N/A'
                        }`}
                        icon={<MapPin className="h-4 w-4" />}
                      />
                    )}
                  </div>
                </InfoCard>

                {/* Additional Information */}
                <InfoCard
                  title="Additional Information"
                  icon={<FileText className="h-5 w-5" />}
                >
                  <div className="space-y-1">
                    <InfoField
                      label="Tax ID"
                      value={data.taxId}
                      icon={<FileText className="h-4 w-4" />}
                    />
                    <InfoField
                      label="Notes"
                      value={data.notes || 'No notes available'}
                      icon={<FileText className="h-4 w-4" />}
                    />
                    <InfoField
                      label="Created At"
                      value={formatDate(data.createdAt)}
                      icon={<Calendar className="h-4 w-4" />}
                    />
                    <InfoField
                      label="Updated At"
                      value={formatDate(data.updatedAt)}
                      icon={<Calendar className="h-4 w-4" />}
                    />
                  </div>
                </InfoCard>

                {/* Payment Methods Section */}
                <InfoCard
                  title="Payment Methods"
                  icon={<CreditCard className="h-5 w-5" />}
                >
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      No payment methods configured
                    </p>
                    <p className="text-sm text-gray-400">
                      Payment methods are managed separately and will be displayed
                      here once configured.
                    </p>
                  </div>
                </InfoCard>
              </div>
            </div>
          </>
        )}
      </div>
    </Slider>
  );
};

export default ViewVendorSlider;
