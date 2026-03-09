import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

// Keep these paths unprotected
const publicRoutes = ["/", "/features", "/pricing", "/login", "/signup", "/api/webhook"];
const authRoutes = ["/login", "/signup"];

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    const isApiRoute = nextUrl.pathname.startsWith("/api");
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);

    // API routes are handled by Next.js routers
    if (isApiRoute) {
        return undefined;
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            const role = (req.auth?.user as any)?.role;
            if (role === "admin" || role === "support_admin") {
                return Response.redirect(new URL("/admin/dashboard", nextUrl));
            }
            return Response.redirect(new URL("/overview", nextUrl));
        }
        return undefined;
    }

    if (!isLoggedIn && !isPublicRoute) {
        return Response.redirect(new URL("/login", nextUrl));
    }

    if (isLoggedIn && nextUrl.pathname.startsWith("/admin")) {
        const role = (req.auth?.user as any)?.role;
        if (role !== "admin" && role !== "support_admin") {
            return Response.redirect(new URL("/overview", nextUrl));
        }
    }

    return undefined;
});

// See "Matching Paths" below to learn more
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
