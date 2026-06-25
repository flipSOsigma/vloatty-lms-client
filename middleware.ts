import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Read token from cookie
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Protect /dashboard and all nested routes under it
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      // If token is missing, redirect to the login page
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from auth pages (login / register) to dashboard
  if (pathname === "/login" || pathname === "/register") {
    if (token) {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

// Config to specify matching paths that run the middleware
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
