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
                token.role = (user as any).email === "rs163592@gmail.com" ? "admin" : (user as any).role;
                token.id = user.id;
                token.isSetupComplete = (user as any).email === "rs163592@gmail.com" ? true : (user as any).isSetupComplete;
            }
            
            // Handle manual updates from client (e.g., after setup completion)
            if (trigger === "update" && session?.isSetupComplete !== undefined) {
                token.isSetupComplete = session.isSetupComplete;
            }

            return token;
        },
        session({ session, token }) {
            if (token && session.user) {
                (session.user as any).role = token.role;
                session.user.id = token.id as string;
                (session.user as any).isSetupComplete = token.isSetupComplete;
            }
            return session;
        }
    }
} satisfies NextAuthConfig;
