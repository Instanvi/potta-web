"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import logoImg from "@/public/instanvi_logo_full.svg";
import { EncryptionUtils, AuthPayload } from "@/lib/security";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusText, setStatusText] = useState("Verifying credentials...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let token = searchParams.get("token") || searchParams.get("accessToken");
    let organizationId = searchParams.get("organizationId");
    const payloadStr = searchParams.get("payload");
    let userPayloadJSON: string | undefined = undefined;

    if (payloadStr) {
      try {
        setStatusText("Decrypting session...");
        const payload = EncryptionUtils.decrypt<AuthPayload & { user?: any }>(payloadStr);
        if (payload) {
          if (payload.token) token = payload.token;
          if (payload.organizationId) organizationId = payload.organizationId;
          if (payload.user) userPayloadJSON = JSON.stringify(payload.user);
        }
      } catch (e) {
        console.error("Payload decryption failed in potta auth callback:", e);
      }
    }

    const synchronizeSession = async () => {
      if (token) {
        setStatusText("Synchronizing session...");

        const result = await signIn("session-sync", {
          token,
          organizationId: organizationId || "",
          userJSON: userPayloadJSON,
          redirect: false,
        });

        if (result?.error) {
          console.error("Auth sync failed in potta:", result.error);
          setError("Session synchronization failed. Please try again.");
          setTimeout(() => router.push("/unauthorized?error=sync_failed"), 3000);
        } else {
          setStatusText("Redirecting...");
          const callbackUrl = searchParams.get("callbackUrl") || "/";
          router.push(callbackUrl);
        }
      } else {
        setError("No authentication token found. Please sign in again.");
        setTimeout(() => router.push("/unauthorized?error=missing_token"), 3000);
      }
    };

    synchronizeSession();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-4 text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
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
          <div className="space-y-1 px-6">
            <p className="text-base font-semibold text-gray-900">{error}</p>
            <p className="text-sm text-gray-500">You will be redirected in a moment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FA]">
      <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
        <Image
          src={logoImg}
          alt="Potta"
          width={120}
          height={36}
          className="h-8 w-auto object-contain mb-4"
        />

        <div className="relative">
          <div className="w-12 h-12 border-2 border-gray-200 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FA]">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-gray-200 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
