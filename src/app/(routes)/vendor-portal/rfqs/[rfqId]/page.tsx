'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import PottaLoader from '@potta/components/pottaloader';
import toast from 'react-hot-toast';
import RFQProformaForm from '../components/RFQProformaForm';
import { useRFQDetails } from '../hooks';
import { RFQTokenData } from '../types';

const VendorRFQPage = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const [tokenData, setTokenData] = useState<RFQTokenData | null>(null);

  // Extract token, rfqId, and vendorId from URL
  useEffect(() => {
    const token = searchParams.get('token');
    const vendorId = searchParams.get('vendorId');
    const rfqId = params.rfqId as string;

    if (token && rfqId && vendorId) {
      setTokenData({ token, rfqId, vendorId });
    } else {
      console.error('Missing required parameters: token, rfqId, or vendorId');
      toast.error(
        'Invalid RFQ link. Please check your email for the correct link.'
      );
    }
  }, [searchParams, params]);

  // Fetch RFQ details
  const {
    data: rfqData,
    isLoading,
    error,
    refetch,
  } = useRFQDetails({
    rfqId: tokenData?.rfqId || '',
    token: tokenData?.token || '',
    vendorId: tokenData?.vendorId || '',
    enabled: !!tokenData,
  });

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Error fetching RFQ details:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to load RFQ details. Please check your access token.';
      toast.error(errorMessage);
    }
  }, [error]);

  // Invalid link - missing token or rfqId
  if (!tokenData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-medium text-gray-800 mb-2">
            Invalid RFQ Link
          </h1>
          <p className="text-gray-600">
            Missing required parameters. Please check your email for the correct
            RFQ link.
          </p>
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
            <p className="text-sm text-gray-700 font-medium mb-2">
              Expected URL format:
            </p>
            <code className="text-xs text-gray-600 break-all">
              /vendor-portal/rfqs/[rfqId]?token=[TOKEN]&vendorId=[VENDOR_ID]
            </code>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <PottaLoader size="lg" />
          <p className="mt-4 text-gray-600">Loading RFQ details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !rfqData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-medium text-gray-800 mb-2">
            RFQ Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            Unable to load RFQ details. The RFQ link may be invalid or expired.
          </p>
          {error && (
            <div className="mb-4 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                {error instanceof Error
                  ? error.message
                  : 'Unknown error occurred'}
              </p>
            </div>
          )}
          <button
            onClick={() => refetch()}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Success state - show RFQ form
  return (
    <RFQProformaForm
      tokenData={tokenData}
      rfqData={rfqData}
      onSuccess={() => refetch()}
    />
  );
};

export default VendorRFQPage;
