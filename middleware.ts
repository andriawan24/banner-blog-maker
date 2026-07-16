import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    const apiDomain = process.env.API_DOMAIN;
    const host = request.headers.get("host");

    if (!apiDomain || host !== apiDomain) {
      return new NextResponse(
        JSON.stringify({ error: "Not Found" }),
        { status: 404, headers: { "content-type": "application/json" } },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
