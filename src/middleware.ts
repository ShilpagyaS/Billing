import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/verify", "/api/auth", "/_next", "/favicon", "/rgtl-logo", "/signature"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // Check auth cookie
  const auth = req.cookies.get("rgtl_auth")?.value;
  if (auth === "authenticated") return NextResponse.next();

  // Redirect to login
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
