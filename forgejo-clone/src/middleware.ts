import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/session";

const PUBLIC_PATHS = ["/", "/(auth)/login", "/(auth)/register", "/explore", "/api/auth/login", "/api/auth/register", "/api/git"];
const ADMIN_PATHS = ["/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public") ||
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  // Allow public user/repo pages (read-only)
  if (/^\/[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_.-]+)?(\/.*)?$/.test(pathname) && !pathname.startsWith("/admin") && !pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth_token")?.value;
  const session = token ? await verifyToken(token) : null;

  // Not authenticated → redirect to login
  if (!session) {
    const loginUrl = new URL("/(auth)/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes → check role
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
