export enum AuthStatus {
  IDLE = "IDLE",
  PROCESSING = "PROCESSING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export interface AuthError {
  code: string;
  message: string;
  isRetryable: boolean;
  timestamp: number;
}

export const AUTH_TIMEOUT = 30000; // 30 seconds
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // 1 second

export const ERROR_CODES = {
  MISSING_PAYLOAD: "MISSING_PAYLOAD",
  INVALID_PAYLOAD: "INVALID_PAYLOAD",
  SESSION_SYNC_FAILED: "SESSION_SYNC_FAILED",
  SESSION_FETCH_FAILED: "SESSION_FETCH_FAILED",
  TIMEOUT: "TIMEOUT",
  UNKNOWN: "UNKNOWN",
} as const;

export class AuthErrorHandler {
  private static readonly RETRYABLE_ERRORS = [
    ERROR_CODES.SESSION_FETCH_FAILED,
    ERROR_CODES.TIMEOUT,
  ];

  static create(
    code: string,
    message: string,
    isRetryable?: boolean
  ): AuthError {
    return {
      code,
      message,
      isRetryable:
        isRetryable ?? (this.RETRYABLE_ERRORS as readonly string[]).includes(code),
      timestamp: Date.now(),
    };
  }

  static getDisplayMessage(error: AuthError): string {
    const messages: Record<string, string> = {
      [ERROR_CODES.MISSING_PAYLOAD]:
        "Authentication data missing. Please try signing in again.",
      [ERROR_CODES.INVALID_PAYLOAD]:
        "Invalid or expired authentication session. Please try signing in again.",
      [ERROR_CODES.SESSION_SYNC_FAILED]:
        "Failed to synchronize your session. Please try again.",
      [ERROR_CODES.SESSION_FETCH_FAILED]:
        "Failed to load your permissions. Please try again.",
      [ERROR_CODES.TIMEOUT]:
        "Authentication took too long. Please try again.",
      [ERROR_CODES.UNKNOWN]:
        "An unexpected error occurred during authentication.",
    };

    return messages[error.code] || messages[ERROR_CODES.UNKNOWN];
  }
}
