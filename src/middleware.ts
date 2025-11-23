import { type NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Skip auth check if admin/[eventId]/submissions
  if (path.endsWith("/submissions")) {
    return NextResponse.next();
  }

  const isSecure = req.nextUrl.protocol === "https:";
  const cookieName = `${isSecure ? "__Secure-" : ""}next-auth.session-token`;
  const session = !!req.cookies.get(cookieName);
  if (!session) {
    return NextResponse.redirect(
      new URL(`/api/auth/signin?callbackUrl=${path}`, req.url),
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
