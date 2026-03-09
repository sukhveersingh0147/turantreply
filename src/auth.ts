import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "./auth.config";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dns from "node:dns";
dns.setDefaultResultOrder('ipv4first');

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    trustHost: true,
    session: { strategy: "jwt" },
    events: {
        async createUser({ user }) {
            // Create a default business for new Google users
            if (user.id) {
                const trialExpiry = new Date();
                trialExpiry.setDate(trialExpiry.getDate() + 7);

                await prisma.business.create({
                    data: {
                        name: `${user.name || "My Business"}`,
                        userId: user.id,
                        plan: "FREE",
                        subscriptionStatus: "TRIAL",
                        subscriptionExpiresAt: trialExpiry,
                    }
                });
            }
        },
    },
    providers: [
        ...authConfig.providers,
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const fs = require('fs');
                const log = (msg: string) => fs.appendFileSync('auth-debug.log', msg + '\n');

                const email = credentials?.email ? (credentials.email as string).trim() : "";
                const dbUrl = process.env.DATABASE_URL || "MISSING";
                const maskedUrl = dbUrl.replace(/:[^@]+@/, ":****@");
                log(`Authorize called with email: "${email}" (DB: ${maskedUrl})`);

                if (!email || !credentials?.password) {
                    log("Missing credentials");
                    return null;
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: {
                            email: email
                        }
                    });

                    log(`User found in DB: ${user ? `"${user.email}"` : "NONE"}`);

                    if (!user) {
                        log(`Login failed: User "${email}" not found.`);
                        return null;
                    }

                    if (!user.password) {
                        log(`Login failed: User "${email}" exists but has no password. (Signed up with Google?)`);
                        return null;
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password as string,
                        user.password as string
                    );
                    log(`Password valid: ${isPasswordValid}`);

                    if (!isPasswordValid) {
                        return null;
                    }

                    if (user.status === "SUSPENDED") {
                        throw new Error("Your account has been suspended. Please contact support.");
                    }

                    log(`Login successful for: ${user.email}`);

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        status: user.status
                    };
                } catch (error) {
                    log(`Auth Error: ${(error as any).message}`);
                    return null;
                }
            }
        })
    ]
});
