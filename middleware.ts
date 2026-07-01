// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("token")?.value;
    const rawUser = req.cookies.get("user")?.value;

    if (!token || !rawUser) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const user = JSON.parse(rawUser);
      if (user.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
