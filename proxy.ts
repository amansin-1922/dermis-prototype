import { createServerClient } from "@supabase/ssr";
import {
  NextResponse,
  type NextRequest,
} from "next/server";

export async function proxy(
  request: NextRequest
) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env
      .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(
                name,
                value
              );
            }
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({
              name,
              value,
              options,
            }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  const {
    data,
    error,
  } = await supabase.auth.getClaims();

  const isAuthenticated =
    !error &&
    Boolean(data?.claims?.sub);

  const pathname =
    request.nextUrl.pathname;

  /*
   * Public Velyquo routes
   */
  const publicRoutes = [
    "/",
    "/login",
    "/pricing",
    "/demo",
  ];

  const isPublicRoute =
    publicRoutes.includes(pathname);

  /*
   * Logged-out visitors cannot access
   * clinic application routes.
   */
  if (
    !isAuthenticated &&
    !isPublicRoute
  ) {
    const loginUrl =
      request.nextUrl.clone();

    loginUrl.pathname = "/login";
    loginUrl.search = "";

    const redirectResponse =
      NextResponse.redirect(loginUrl);

    response.cookies
      .getAll()
      .forEach((cookie) => {
        redirectResponse.cookies.set(
          cookie
        );
      });

    return redirectResponse;
  }

  /*
   * Logged-in users visiting /login
   * go directly to their dashboard.
   */
  if (
    isAuthenticated &&
    pathname === "/login"
  ) {
    const dashboardUrl =
      request.nextUrl.clone();

    dashboardUrl.pathname =
      "/dashboard";
    dashboardUrl.search = "";

    const redirectResponse =
      NextResponse.redirect(
        dashboardUrl
      );

    response.cookies
      .getAll()
      .forEach((cookie) => {
        redirectResponse.cookies.set(
          cookie
        );
      });

    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};