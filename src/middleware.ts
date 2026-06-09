import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

// Keep these paths unprotected
const publicRoutes = ["/", "/features", "/pricing", "/about", "/contact", "/login", "/signup", "/api/webhook", "/salon", "/gym", "/coaching", "/realestate", "/restaurant"];
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

    // 3. Setup Redirection
    const isSetupComplete = (req.auth?.user as any)?.isSetupComplete;
    const plan = (req.auth?.user as any)?.plan;
    const onboardingCompleted = (req.auth?.user as any)?.onboardingCompleted;
    const role = (req.auth?.user as any)?.role;
    
    const isOnboardingRoute = nextUrl.pathname.startsWith("/onboarding");
    const isPlansRoute = nextUrl.pathname === "/onboarding/plans";
    const isWizardRoute = nextUrl.pathname === "/onboarding/wizard";
    const isAdminRoute = nextUrl.pathname.startsWith("/admin");
    
    if (isLoggedIn && !isPublicRoute && !isApiRoute) {
        // Admin bypass for plan and onboarding checks
        if (role === "admin" || role === "support_admin") {
            if (isOnboardingRoute) {
                return Response.redirect(new URL("/admin/dashboard", nextUrl));
            }
            return undefined; // Let admins access anything (except they shouldn't be forced to onboard)
        }

        // If no plan is selected yet or is FREE (legacy)
        if (plan === "PENDING" || plan === "FREE" || !plan) {
            if (!isPlansRoute) {
                return Response.redirect(new URL("/onboarding/plans", nextUrl));
            }
        } 
        // Plan selected, but onboarding not finished
        else if (!onboardingCompleted) {
            if (!isWizardRoute) {
                return Response.redirect(new URL("/onboarding/wizard", nextUrl));
            }
        }
        // Everything finished, but trying to access onboarding
        else if (isOnboardingRoute) {
            return Response.redirect(new URL("/overview", nextUrl));
        }
    }

    return undefined;
});

// See "Matching Paths" below to learn more
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)"],
};
