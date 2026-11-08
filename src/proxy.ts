import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Session } from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

const AUTH_CALLBACK_PATH = '/auth-callback';
const SUPER_APP_URL = process.env.NEXT_PUBLIC_SUPER_APP_URL || 'https://auth.instanvi.com';

/** Reachable without a Potta session (vendors open the portal from an emailed link). */
const PUBLIC_PREFIXES = ['/login', AUTH_CALLBACK_PATH, '/vendor-portal', '/unauthorized'];

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export default auth((req: NextRequest & { auth: Session | null }) => {
  const { nextUrl } = req;
  if (isPublic(nextUrl.pathname) || req.auth) {
    return NextResponse.next();
  }

  const returnPath = `${nextUrl.pathname}${nextUrl.search}`;
  const callbackUrl = `${nextUrl.origin}${AUTH_CALLBACK_PATH}?callbackUrl=${encodeURIComponent(returnPath)}`;
  return NextResponse.redirect(
    `${SUPER_APP_URL}/login?callbackUrl=${encodeURIComponent(callbackUrl)}&desktop=true`,
  );
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
