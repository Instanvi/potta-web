"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorType = searchParams.get("error");

  const errorMessages: Record<string, { title: string; description: string }> = {
    sync_failed: {
      title: "Session Sync Failed",
      description:
        "We couldn't synchronize your session. This usually means your login has expired or the authentication token was invalid.",
    },
    missing_token: {
      title: "Authentication Required",
      description:
        "No valid authentication credentials were provided. Please sign in through the main portal to continue.",
    },
  };

  const currentError = errorMessages[errorType || ""] || {
    title: "Access Denied",
    description:
      "You don't have the required permissions to access this resource. Please sign in or contact your organization administrator.",
  };

  const handleRetry = () => {
    const superAppUrl =
      process.env.NEXT_PUBLIC_SUPER_APP_URL || "http://localhost:3000";
    const pottaOrigin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3001";
    const callbackUrl = `${pottaOrigin}/auth-callback?callbackUrl=/`;

    window.location.href = `${superAppUrl}/login?callbackUrl=${encodeURIComponent(callbackUrl)}&desktop=true`;
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-6">
      <div className="max-w-md w-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 256 256"
                className="text-red-500"
              >
                <path
                  fill="currentColor"
                  d="M208 80H176V56a48 48 0 0 0-96 0v24H48a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16Zm-80 84a12 12 0 1 1 12-12a12 12 0 0 1-12 12Zm40-84H96V56a32 32 0 0 1 64 0v24Z"
                />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center">
              !
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <p className="text-sm font-medium tracking-widest uppercase text-gray-400">
            Unauthorized
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {currentError.title}
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-sm mx-auto">
            {currentError.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleGoHome}
            className="w-full sm:w-auto h-11 px-6 text-sm font-normal border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 256 256"
              fill="currentColor"
            >
              <path d="M224 120v96a8 8 0 0 1-8 8h-56a8 8 0 0 1-8-8v-52h-48v52a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8v-96a8 8 0 0 1 2.34-5.66l88-88a8 8 0 0 1 11.32 0l88 88A8 8 0 0 1 224 120Z" />
            </svg>
            Go Home
          </button>
          <button
            onClick={handleRetry}
            className="w-full sm:w-auto h-11 px-6 text-sm font-normal bg-[#2E7D32] text-white hover:bg-[#256828] transition-colors flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 256 256"
              fill="currentColor"
            >
              <path d="M224 128a96 96 0 0 1-163.86 67.86a8 8 0 0 1 11.32-11.32a80 80 0 1 0-1.67-115.1L96 96h-64V32l26.34 26.34A96 96 0 0 1 224 128Z" />
            </svg>
            Sign In Again
          </button>
        </div>

        {/* Help text */}
        <p className="text-xs text-gray-400 pt-4">
          If this problem persists, please contact your system administrator.
        </p>
      </div>
    </div>
  );
}