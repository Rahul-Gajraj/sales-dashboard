import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip middleware for auth routes, public files, and API routes except protected ones
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/manifest.json") ||
    pathname.startsWith("/sw.js") ||
    pathname.startsWith("/icon-") ||
    pathname.startsWith("/favicon") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Check if the path requires authentication
  const protectedPaths = [
    "/dashboard",
    "/leaderboard",
    "/rules",
    "/achieved-logs",
    "/refund-logs",
  ];
  const isProtectedRoute = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // If no token, redirect to home for sign-in
    if (!token) {
      const url = new URL("/", request.url);
      return NextResponse.redirect(url);
    }

    // Check if user email is from allowed domains
    if (token.email) {
      const allowedDomains = process.env.ALLOWED_GOOGLE_WORKSPACE_DOMAIN?.split(
        ","
      ).map((d) => d.trim()) || ["cronberry.com"];
      const isAllowed = allowedDomains.some((domain) =>
        token.email.endsWith(`@${domain}`)
      );

      if (!isAllowed) {
        const url = new URL("/auth/error", request.url);
        url.searchParams.set("error", "AccessDenied");
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // On error, redirect to home
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json, sw.js (PWA files)
     * - icon-* (PWA icons)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon-).*)",
  ],
};
