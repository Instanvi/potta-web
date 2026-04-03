'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 text-center">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        {/* Error Message */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Oops! Something unexpected happened
        </h2>

        <p className="text-gray-600 mb-6 leading-relaxed">
          We're sorry for the inconvenience. Our team has been automatically
          alerted about this issue and is working to resolve it.
        </p>

        {/* Error Details (for debugging) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 mb-2">
              Error Details (Development)
            </summary>
            <div className="bg-gray-100 p-3  text-xs text-gray-700 font-mono overflow-auto">
              {error.message}
              {error.digest && (
                <div className="mt-2">
                  <strong>Error ID:</strong> {error.digest}
                </div>
              )}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white  hover:bg-green-700 transition-colors font-medium"
            onClick={() => reset()}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <button
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700  hover:bg-gray-200 transition-colors font-medium"
            onClick={() => (window.location.href = '/')}
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>

        {/* Support Information */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            If this problem persists, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
