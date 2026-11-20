/** In-memory access token synced from SessionProvider; avoids getSession() on every request. */
let accessToken: string | null = null;

export function setAccessToken(token: string | null | undefined) {
  accessToken = token?.trim() ? token : null;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}
