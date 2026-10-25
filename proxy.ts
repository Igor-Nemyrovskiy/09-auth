import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { checkSession } from "@/lib/api/serverApi";

const privateRoutes = ["/notes", "/profile"];
const publicRoutes = ["/sign-in", "/sign-up"];

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPrivateRoute = privateRoutes.some((route) =>
    matchesRoute(pathname, route),
  );

  const isPublicRoute = publicRoutes.some((route) =>
    matchesRoute(pathname, route),
  );

  const cookieStore = await cookies();

  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  let isAuthenticated = Boolean(accessToken);
  let refreshedCookies: string[] = [];

  if (!accessToken && refreshToken) {
    try {
      const sessionResponse = await checkSession();

      const setCookie = sessionResponse.headers["set-cookie"];

      if (setCookie) {
        refreshedCookies = Array.isArray(setCookie) ? setCookie : [setCookie];

        const hasNewAccessToken = refreshedCookies.some((cookie) =>
          cookie.startsWith("accessToken="),
        );

        isAuthenticated = hasNewAccessToken;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  let response: NextResponse;

  if (isPrivateRoute && !isAuthenticated) {
    response = NextResponse.redirect(new URL("/sign-in", request.url));
  } else if (isPublicRoute && isAuthenticated) {
    response = NextResponse.redirect(new URL("/", request.url));
  } else {
    response = NextResponse.next();
  }

  refreshedCookies.forEach((cookie) => {
    response.headers.append("set-cookie", cookie);
  });

  return response;
}

export const config = {
  matcher: ["/notes/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
};
