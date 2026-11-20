'use client';
import React from 'react';
import { CheckCircle } from 'lucide-react';

const VendorPortalSuccess = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white  shadow-sm p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>

        <h1 className="text-2xl font-medium text-gray-900 mb-4">
          Invoice Created Successfully!
        </h1>

        <p className="text-gray-600 mb-6">
          Your vendor invoice has been created and submitted successfully. You
          will receive a confirmation email shortly.
        </p>

        <div className="bg-green-50 border border-green-200  p-4 mb-6">
          <p className="text-sm text-green-800">
            <strong>What happens next?</strong>
          </p>
          <ul className="text-sm text-green-700 mt-2 space-y-1">
            <li>• Your invoice is being processed</li>
            <li>• You'll receive payment confirmation</li>
            <li>• Keep this page for your records</li>
          </ul>
        </div>

        <div className="text-sm text-gray-500">
          <p>Thank you for using our vendor portal!</p>
        </div>
      </div>
    </div>
  );
};

export default VendorPortalSuccess;
