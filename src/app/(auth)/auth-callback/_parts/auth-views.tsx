import Image from "next/image";
import Button from "@/components/button";
import { AuthError, AuthErrorHandler, MAX_RETRIES } from "./types";

interface ErrorViewProps {
  error: AuthError;
  retryCount: number;
  callbackUrl: string;
  superAppUrl: string;
  onRetry: () => void;
  onGoHome: () => void;
}

export function AuthErrorView({
  error,
  retryCount,
  callbackUrl,
  superAppUrl,
  onRetry,
  onGoHome,
}: ErrorViewProps) {
  const displayMessage = AuthErrorHandler.getDisplayMessage(error);
  const canRetry = error.isRetryable && retryCount < MAX_RETRIES;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F8F9FA] text-[#1A1C1E]">
      <div className="flex flex-col items-center space-y-6 max-w-sm text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 256 256"
            className="text-red-500"
          >
            <path
              fill="currentColor"
              d="M236.8 188.09L149.35 36.22a24.76 24.76 0 0 0-42.7 0L19.2 188.09a23.51 23.51 0 0 0 0 23.72A24.35 24.35 0 0 0 40.55 224h174.9a24.35 24.35 0 0 0 21.33-12.19a23.51 23.51 0 0 0 .02-23.72M120 104a8 8 0 0 1 16 0v40a8 8 0 0 1-16 0Zm8 88a12 12 0 1 1 12-12a12 12 0 0 1-12 12"
            />
          </svg>
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">
            {canRetry ? "Connection Issue" : "Sync Failed"}
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            {displayMessage}
          </p>
          {process.env.NODE_ENV === "development" && (
            <p className="text-xs text-gray-400 mt-2 font-mono">
              Code: {error.code}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 w-full">
          {canRetry ? (
            <Button
              type="button"
              onClick={onRetry}
              width="full"
              text={`Retry (${retryCount + 1}/${MAX_RETRIES})`}
              className="bg-[#2E7D32] hover:bg-[#1B5E20] transition-colors"
            />
          ) : (
            <Button
              type="button"
              onClick={() => {
                const retryUrl = `${window.location.origin}/auth-callback?callbackUrl=${encodeURIComponent(callbackUrl)}`;
                window.location.href = `${superAppUrl}/login?callbackUrl=${encodeURIComponent(retryUrl)}&desktop=true`;
              }}
              width="full"
              text="Sign In Again"
              className="bg-[#2E7D32] hover:bg-[#1B5E20] transition-colors"
            />
          )}
          <Button
            type="button"
            onClick={onGoHome}
            theme="outline"
            width="full"
            text="Go Home"
            className="border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32]/5 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}

export function AuthLoadingView() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F8F9FA]">
      <div className="flex flex-col items-center space-y-8 animate-in fade-in duration-500">
        <Image
          src="/potta.svg"
          alt="Potta"
          width={120}
          height={36}
          className="h-8 w-auto object-contain transition-opacity"
        />

        <div className="relative">
          <div className="w-10 h-10 border-2 border-gray-100 rounded-full" />
          <div className="absolute inset-0 w-10 h-10 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm text-gray-400 animate-pulse">Synchronizing your experience...</p>
      </div>
    </div>
  );
}
