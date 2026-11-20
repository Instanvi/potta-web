"use client";

import {
  useLayoutEffect,
  useState,
  Suspense,
  useRef,
  useCallback,
} from "react";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { EncryptionUtils, AuthPayload } from "@/lib/security";
import { usePermissionStore } from "@/lib/store/permission-store";
import { useGetAuthSession } from "@/hooks/use-permission";
import {
  AuthStatus,
  AuthError,
  AuthErrorHandler,
  ERROR_CODES,
  AUTH_TIMEOUT,
  MAX_RETRIES,
  RETRY_DELAY,
} from "./_parts/types";
import { AuthErrorView, AuthLoadingView } from "./_parts/auth-views";

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const { status: sessionStatus } = useSession();
  const [authStatus, setAuthStatus] = useState<AuthStatus>(AuthStatus.IDLE);
  const [error, setError] = useState<AuthError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const processedRef = useRef(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const superAppUrl =
    process.env.NEXT_PUBLIC_SUPER_APP_URL || "http://localhost:3000";
  const { setSession, session: storeSession } = usePermissionStore();

  const { mutateAsync: fetchAuthSession } = useGetAuthSession({
    onSuccess: (data) => {
      console.log("Auth session fetched successfully:", data);
      setSession(data);
    },
    onError: (error) => {
      console.error("Auth session fetch error:", error);
    },
  });

  const payloadStr = searchParams.get("payload");
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const setAuthTimeout = useCallback(() => {
    const timeoutId = setTimeout(() => {
      if (processedRef.current) return;
      setAuthStatus(AuthStatus.FAILED);
      setError(
        AuthErrorHandler.create(ERROR_CODES.TIMEOUT, "Authentication timeout"),
      );
    }, AUTH_TIMEOUT);
    timeoutIdRef.current = timeoutId;
    return timeoutId;
  }, []);

  const clearAuthTimeout = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  const executeAuthFlow = useCallback(
    async function flow(attempt: number = 1): Promise<boolean> {
      if (processedRef.current) return false;

      try {
        if (!payloadStr) {
          // If no payload, but already authenticated in NextAuth, we might be fine
          if (sessionStatus === "authenticated" && storeSession) {
            processedRef.current = true;
            window.location.replace(callbackUrl);
            return true;
          }
          
          setError(
            AuthErrorHandler.create(
              ERROR_CODES.MISSING_PAYLOAD,
              "Missing payload",
            ),
          );
          setAuthStatus(AuthStatus.FAILED);
          return false;
        }

        setAuthStatus(AuthStatus.PROCESSING);

        // 1. Decrypt
        let credentials: AuthPayload;
        try {
          const decrypted = EncryptionUtils.decrypt<AuthPayload>(payloadStr);
          if (!decrypted) throw new Error("Decryption returned null");
          credentials = decrypted;
        } catch {
          setError(
            AuthErrorHandler.create(
              ERROR_CODES.INVALID_PAYLOAD,
              "Decryption failed",
            ),
          );
          setAuthStatus(AuthStatus.FAILED);
          return false;
        }

        if (!credentials?.token) {
          setError(
            AuthErrorHandler.create(
              ERROR_CODES.INVALID_PAYLOAD,
              "Invalid session",
            ),
          );
          setAuthStatus(AuthStatus.FAILED);
          return false;
        }

        // 2. Sync NextAuth
        const result = await signIn("session-sync", {
          token: credentials.token,
          organizationId: credentials.organizationId || "",
          userJSON: credentials.user
            ? JSON.stringify(credentials.user)
            : undefined,
          redirect: false,
        });

        if (result?.error) {
          const isRetryable =
            attempt < MAX_RETRIES &&
            (result.error.includes("network") ||
              result.error.includes("timeout"));
          if (isRetryable) {
            await new Promise((r) => setTimeout(r, RETRY_DELAY * attempt));
            return flow(attempt + 1);
          }
          setError(
            AuthErrorHandler.create(
              ERROR_CODES.SESSION_SYNC_FAILED,
              result.error,
            ),
          );
          setAuthStatus(AuthStatus.FAILED);
          return false;
        }

        // 3. Fetch Session
        try {
          await fetchAuthSession();
        } catch (e) {
          console.error("Failed to fetch session:", e);
          const isRetryable = attempt < MAX_RETRIES;
          if (isRetryable) {
            await new Promise((r) => setTimeout(r, RETRY_DELAY * attempt));
            return flow(attempt + 1);
          }
          setError(
            AuthErrorHandler.create(
              ERROR_CODES.SESSION_FETCH_FAILED,
              "Fetch failed",
            ),
          );
          setAuthStatus(AuthStatus.FAILED);
          return false;
        }

        // 4. Success
        processedRef.current = true;
        setAuthStatus(AuthStatus.SUCCESS);
        clearAuthTimeout();
        await new Promise((r) => setTimeout(r, 100));
        window.location.replace(callbackUrl);
        return true;
      } catch (e) {
        console.error("Unexpected error in auth flow:", e);
        setError(
          AuthErrorHandler.create(ERROR_CODES.UNKNOWN, "Unexpected error"),
        );
        setAuthStatus(AuthStatus.FAILED);
        return false;
      }
    },
    [payloadStr, callbackUrl, fetchAuthSession, clearAuthTimeout, sessionStatus, storeSession],
  );

  useLayoutEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      if (
        processedRef.current ||
        authStatus !== AuthStatus.IDLE ||
        sessionStatus === "loading"
      )
        return;

      if (sessionStatus === "authenticated" && storeSession) {
        processedRef.current = true;
        if (isMounted) {
          setAuthStatus(AuthStatus.SUCCESS);
          window.location.replace(callbackUrl);
        }
        return;
      }

      setAuthTimeout();
      const success = await executeAuthFlow();
      if (!isMounted) return;
      if (!success) {
        clearAuthTimeout();
      }
    };

    initAuth();
    return () => {
      isMounted = false;
      clearAuthTimeout();
    };
  }, [
    sessionStatus,
    storeSession,
    callbackUrl,
    authStatus,
    setAuthTimeout,
    clearAuthTimeout,
    executeAuthFlow,
  ]);

  if (error) {
    return (
      <AuthErrorView
        error={error}
        retryCount={retryCount}
        callbackUrl={callbackUrl}
        superAppUrl={superAppUrl}
        onRetry={() => {
          setRetryCount((p) => p + 1);
          setError(null);
          setAuthStatus(AuthStatus.IDLE);
          processedRef.current = false;
          executeAuthFlow();
        }}
        onGoHome={() => (window.location.href = superAppUrl)}
      />
    );
  }

  return <AuthLoadingView />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthLoadingView />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
