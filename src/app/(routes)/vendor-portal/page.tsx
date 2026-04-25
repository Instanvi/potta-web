'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import VendorInvoiceForm from './components/VendorInvoiceForm';
import { PurchaseOrderDetails } from './types';
import PottaLoader from '@potta/components/pottaloader';
import useGetVendorPurchaseOrder from './hooks/useGetVendorPurchaseOrder';
import toast from 'react-hot-toast';

const VendorPortal = () => {
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);

  // Extract token, orgId, and locationId from URL on component mount
  useEffect(() => {
    const urlToken = searchParams.get('token');
    const urlOrgId = searchParams.get('orgId');
    const urlLocationId = searchParams.get('locationId');

    if (urlToken) {
      setToken(urlToken);
    } else {
      console.error('Missing required parameter: token');
    }

    if (urlOrgId) {
      setOrgId(urlOrgId);
    }

    if (urlLocationId) {
      setLocationId(urlLocationId);
    }
  }, [searchParams]);

  // Fetch purchase order details
  const {
    data: purchaseOrder,
    isLoading,
    error,
  } = useGetVendorPurchaseOrder({
    token: token || '',
    orgId: orgId || undefined,
    locationId: locationId || undefined,
    enabled: !!token,
  });

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Error fetching purchase order:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to load purchase order details. Please check your access token.';
      toast.error(errorMessage);
    }
  }, [error]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-medium text-gray-800 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">Missing access token.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PottaLoader size="lg" />
      </div>
    );
  }

  if (error || !purchaseOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-medium text-gray-800 mb-2">
            Purchase Order Not Found
          </h1>
          <p className="text-gray-600">
            Unable to load purchase order details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorInvoiceForm
        token={token}
        purchaseOrder={purchaseOrder}
        orgId={orgId || undefined}
        locationId={locationId || undefined}
      />
    </div>
  );
};

export default VendorPortal;
