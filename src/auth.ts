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
    adapter: PrismaAdapter(prisma) as any,
    events: {
        async createUser({ user }) {
            // Create a default business for new Google users
            if (user.id) {
                // Handle referral from cookie if available
                let referredById = null;
                try {
                    const { cookies } = await import("next/headers");
                    const cookieStore = await cookies();
                    const refCode = cookieStore.get("referral_code")?.value;

                    if (refCode) {
                        const affiliate = await prisma.affiliate.findUnique({
                            where: { referralCode: refCode }
                        });
                        if (affiliate) {
                            referredById = affiliate.userId;
                        }
                    }
                } catch (e) {
                    console.error("Failed to read referral cookie in createUser:", e);
                }

                await prisma.user.update({
                    where: { id: user.id },
                    data: { 
                        referredById,
                        isSetupComplete: false
                    }
                });

                if (referredById) {
                    await prisma.affiliate.update({
                        where: { userId: referredById },
                        data: { referralsCount: { increment: 1 } }
                    });
                }

                await prisma.business.create({
                    data: {
                        name: `${user.name || "My Business"}`,
                        userId: user.id,
                        plan: "FREE",
                        subscriptionStatus: "ACTIVE",
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
                const email = credentials?.email ? (credentials.email as string).trim().toLowerCase() : "";
                console.log(`[AUTH] Authorize called for email: "${email}"`);

                if (!email || !credentials?.password) {
                    console.log("[AUTH] Missing credentials");
                    return null;
                }

                try {
                    // 1. Permanent Admin Override (Hardcoded)
                    if (email === "rs163592@gmail.com" && credentials?.password === "saurabh@2005") {
                        console.log("[AUTH] Permanent Admin authorized via credentials");
                        // Check if user exists in DB to get its ID, otherwise return a synthetic one
                        const dbUser = await prisma.user.findUnique({ where: { email } });
                        return {
                            id: dbUser?.id || "admin_permanent",
                            name: dbUser?.name || "Super Admin",
                            email: "rs163592@gmail.com",
                            role: "admin",
                            status: "ACTIVE",
                            isSetupComplete: true
                        };
                    }

                    const user = await prisma.user.findUnique({
                        where: { email }
                    });

                    if (!user) {
                        console.log(`[AUTH] Login failed: User "${email}" not found.`);
                        return null;
                    }

                    if (!user.password) {
                        console.log(`[AUTH] Login failed: User "${email}" has no password (OAuth user).`);
                        return null;
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password as string,
                        user.password as string
                    );

                    if (!isPasswordValid) {
                        console.log(`[AUTH] Login failed: Incorrect password for "${email}".`);
                        return null;
                    }

                    if (user.status === "SUSPENDED") {
                        throw new Error("Your account has been suspended. Please contact support.");
                    }

                    console.log(`[AUTH] Login successful for: ${user.email}`);

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.email === "rs163592@gmail.com" ? "admin" : user.role, // Force role for main email
                        status: user.status,
                        isSetupComplete: user.isSetupComplete
                    };
                } catch (error) {
                    console.error("[AUTH] Error:", (error as any).message);
                    return null;
                }
            }
        })
    ]
});
