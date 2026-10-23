import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { checkSession } from "@/lib/api/serverApi";

const privateRoutes = ["/notes", "/profile"];
const publicRoutes = ["/sign-in", "/sign-up"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const cookieStore = await cookies();

  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  let isAuthenticated = Boolean(accessToken);
  let sessionResponse;

  if (!accessToken && refreshToken) {
    try {
      sessionResponse = await checkSession();

      isAuthenticated = sessionResponse.data.success;
    } catch {
      isAuthenticated = false;
    }
  }

  let response: NextResponse;

  if (isPrivateRoute && !isAuthenticated) {
    response = NextResponse.redirect(new URL("/sign-in", request.url));
  } else if (isPublicRoute && isAuthenticated) {
    response = NextResponse.redirect(new URL("/profile", request.url));
  } else {
    response = NextResponse.next();
  }

  if (sessionResponse) {
    const setCookie = sessionResponse.headers["set-cookie"];

    if (setCookie) {
      const cookiesArray = Array.isArray(setCookie) ? setCookie : [setCookie];

      cookiesArray.forEach((cookie) => {
        response.headers.append("set-cookie", cookie);
      });
    }
  }

  return response;
}

export const config = {
  matcher: ["/notes/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
};
