'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import KYCVerificationForm from './components/KYCVerificationForm';

interface KYCTokenData {
  token: string;
  vendorId: string;
}

const KYCVerificationPage = () => {
  const searchParams = useSearchParams();
  const [tokenData, setTokenData] = useState<KYCTokenData | null>(null);

  // Extract token data from URL on component mount
  useEffect(() => {
    const token = searchParams.get('token');
    const vendorId = searchParams.get('vendorId');

    if (token && vendorId) {
      setTokenData({ token, vendorId });
    } else {
      console.error('Missing required parameters: token or vendorId');
      toast.error(
        'Invalid verification link. Please check your email for the correct link.'
      );
    }
  }, [searchParams]);

  if (!tokenData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-medium text-gray-800 mb-2">
            Invalid Verification Link
          </h1>
          <p className="text-gray-600">
            Missing required parameters. Please check your email for the correct
            verification link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <KYCVerificationForm tokenData={tokenData} />
    </div>
  );
};

export default KYCVerificationPage;
