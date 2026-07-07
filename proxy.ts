import { NextResponse, NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Read token from cookie
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Function to check if a JWT token is expired
  const isTokenExpired = (jwtToken: string): boolean => {
    try {
      const parts = jwtToken.split('.');
      if (parts.length !== 3) return true; // Invalid token format
      
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = atob(payloadBase64);
      const payload = JSON.parse(decodedPayload);
      
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return true; // Expired
      }
      return false; // Not expired
    } catch (err) {
      return true; // Error decoding implies invalid/expired
    }
  };

  // Protect /dashboard and all nested routes under it
  if (pathname.startsWith("/dashboard")) {
    if (!token || isTokenExpired(token)) {
      // If token is missing or expired, redirect to the login page with expired=true parameter if expired
      const loginUrl = new URL("/login", request.url);
      if (token) {
        loginUrl.searchParams.set("expired", "true");
      }
      
      const response = NextResponse.redirect(loginUrl);
      // Clear cookie
      response.cookies.set("token", "", { path: "/", expires: new Date(0) });
      return response;
    }
  }

  // Redirect authenticated users away from auth pages (login / register) to dashboard
  if (pathname === "/login" || pathname === "/register") {
    if (token && !isTokenExpired(token)) {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

// Config to specify matching paths that run the proxy
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
