import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export default {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "dummy_client_id",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy_client_secret",
            allowDangerousEmailAccountLinking: true,
        })
    ],
    pages: {
        signIn: "/login",
    },
    trustHost: true,
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = (user as any).email === "rs163592@gmail.com" ? "admin" : (user as any).role || "client";
                token.id = user.id as string;
                token.businessType = (user as any).businessType || null;
                token.dashboardSeeded = (user as any).dashboardSeeded || false;
                token.onboardingCompleted = (user as any).onboardingCompleted || false;
                token.isSetupComplete = (user as any).isSetupComplete || false;
            }
            
            // Handle manual updates from client (e.g., after setup completion)
            if (trigger === "update") {
                if (session?.isSetupComplete !== undefined) token.isSetupComplete = session.isSetupComplete;
                if (session?.onboardingCompleted !== undefined) token.onboardingCompleted = session.onboardingCompleted;
                if (session?.businessType !== undefined) token.businessType = session.businessType;
                if (session?.dashboardSeeded !== undefined) token.dashboardSeeded = session.dashboardSeeded;
            }

            return token;
        },
        session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.businessType = token.businessType as string | null;
                session.user.dashboardSeeded = token.dashboardSeeded as boolean;
                session.user.onboardingCompleted = token.onboardingCompleted as boolean;
                session.user.isSetupComplete = token.isSetupComplete as boolean;
            }
            return session;
        }
    }
} satisfies NextAuthConfig;
