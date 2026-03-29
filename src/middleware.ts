import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const authRoutes = [
    "/sign-in",
    "/auth-callback",
  ];

  const bypassRoutes = [
    "/vendor-portal",
    "/vendor/rfqs",
    "/organigram", // Mentioned in useGetUser too
  ];

  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route),
  );

  const isBypassRoute = bypassRoutes.some((route) =>
    nextUrl.pathname.startsWith(route),
  );

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  if (isBypassRoute) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    let callbackPath = nextUrl.pathname;
    if (nextUrl.search) {
      callbackPath += nextUrl.search;
    }
    const encodedCallbackPath = encodeURIComponent(callbackPath);
    
    // Redirect to the Super App for identification
    const superAppUrl = process.env.NEXT_PUBLIC_SUPER_APP_URL || "http://localhost:3000";
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4300"}/auth-callback?callbackUrl=${encodedCallbackPath}`;
    
    return NextResponse.redirect(
      `${superAppUrl}/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
