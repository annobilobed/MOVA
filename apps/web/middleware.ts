import { NextResponse, type NextRequest } from "next/server";

// Fast redirect for signed-out visitors. Real authorisation is enforced by the API on every request.
export function middleware(req: NextRequest) {
  if (!req.cookies.get("mova_session")) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    url.search = `?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/tickets/:path*", "/profile/:path*", "/driver/:path*", "/operator/:path*", "/admin/:path*", "/payments/:path*", "/checkout/:path*"],
};
