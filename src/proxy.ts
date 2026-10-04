import { NextRequest, NextResponse } from "next/server";
import { adminConfigured, isAdmin } from "@/lib/auth";
export function proxy(request: NextRequest) {
  if (!adminConfigured())
    return new NextResponse("Admin credentials are not configured.", {
      status: 503,
    });
  if (!isAdmin(request.headers.get("authorization")))
    return new NextResponse("Authentication required.", {
      status: 401,
      headers: {
        "WWW-Authenticate":
          'Basic realm="Film administration", charset="UTF-8"',
        "Cache-Control": "no-store",
      },
    });
  return NextResponse.next();
}
export const config = { matcher: ["/adminpage/:path*", "/api/admin/:path*"] };
