import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

// Keep these paths unprotected
const publicRoutes = ["/", "/features", "/pricing", "/about", "/contact", "/login", "/signup", "/api/webhook"];
const authRoutes = ["/login", "/signup"];

/**
 * Simple Rate Limiter (Memory-based)
 * Note: On Vercel, this is per-instance. For global, use Redis/Upstash.
 */
const rateLimitMap = new Map<string, { count: number; reset: number }>();
const LIMIT = 100; // requests
const WINDOW = 60 * 1000; // 1 minute

function isRateLimited(ip: string) {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.reset) {
        rateLimitMap.set(ip, { count: 1, reset: now + WINDOW });
        return false;
    }

    record.count++;
    return record.count > LIMIT;
}

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

    const isApiRoute = nextUrl.pathname.startsWith("/api");
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);

    // 1. Rate Limiting for API
    if (isApiRoute && isRateLimited(ip)) {
        return new Response("Too Many Requests", { status: 429 });
    }

    // 2. Auth Protection
    if (isApiRoute) {
        // Allow public webhooks
        if (nextUrl.pathname.startsWith("/api/webhook")) return undefined;
        // Require auth for others
        if (!isLoggedIn) return new Response("Unauthorized", { status: 401 });
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


    return undefined;
});

// See "Matching Paths" below to learn more
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)"],
};
