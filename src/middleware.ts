import { NextResponse } from "next/server";

import { auth } from "@/auth";

export default auth((req) => {
  const path = req.nextUrl.pathname;
  if (
    !req.auth &&
    (path === "/salvage" ||
      path.startsWith("/salvage/") ||
      path === "/mianzi" ||
      path.startsWith("/mianzi/"))
  ) {
    const url = new URL("/auth/signin", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/salvage/:path*", "/mianzi/:path*"],
};
