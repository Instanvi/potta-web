'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PottaLoader from '@potta/components/pottaloader';
import { Suspense } from 'react';

function LoginRedirect() {
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log("Initiating login redirect...");
    const superAppUrl = process.env.NEXT_PUBLIC_SUPER_APP_URL || 'https://auth.instanvi.com';
    const currentOrigin = window.location.origin;
    
    // Preserve the original callbackUrl if present, otherwise default to root
    const requestedCallbackUrl = searchParams.get('callbackUrl') || '/';
    
    // Build the potta auth-callback URL with the nested callbackUrl
    const pottaCallbackUrl = `${currentOrigin}/auth-callback?callbackUrl=${encodeURIComponent(requestedCallbackUrl)}`;
    
    // Redirect to super-app login with desktop=true flag
    const authUrl = new URL(`${superAppUrl}/login`);
    authUrl.searchParams.set('callbackUrl', pottaCallbackUrl);
    authUrl.searchParams.set('desktop', 'true');
    
    console.log("Redirecting to:", authUrl.toString());
    window.location.href = authUrl.toString();
  }, [searchParams]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#F9F9F9]">
      <PottaLoader size="lg" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-[#F9F9F9]">
        <PottaLoader size="lg" />
      </div>
    }>
      <LoginRedirect />
    </Suspense>
  );
}
