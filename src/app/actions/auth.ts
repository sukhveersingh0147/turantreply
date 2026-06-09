"use server";

import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export async function register(prevState: any, formData: FormData) {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = (formData.get("email") as string || "").trim().toLowerCase();
    const password = formData.get("password") as string;
    const company = formData.get("companyName") as string;
    const phone = formData.get("phone") as string;
    const vertical = formData.get("vertical") as string;

    const refCode = formData.get("ref") as string;

    if (!email || !password || !firstName || !company) {
        return { error: "Missing required fields" };
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { error: "Email already exists" };
        }

        let referredById = null;
        if (refCode) {
            const affiliate = await prisma.affiliate.findUnique({
                where: { referralCode: refCode }
            });
            if (affiliate) {
                referredById = affiliate.userId;
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User and empty Business in a transaction
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const user = await tx.user.create({
                data: {
                    name: `${firstName} ${lastName}`,
                    email,
                    password: hashedPassword,
                    referredById,
                    isSetupComplete: false,
                    onboardingCompleted: false,
                }
            });

            await tx.business.create({
                data: {
                    name: company,
                    userId: user.id,
                    whatsappNumber: phone || null,
                    plan: "PENDING",
                    subscriptionStatus: "PENDING",
                    businessType: vertical?.toUpperCase() || "OTHER",
                    industry: vertical || "OTHER",
                    dashboardSeeded: !!vertical,
                }
            });

            if (vertical) {
                await tx.user.update({
                    where: { id: user.id },
                    data: { 
                        onboardingCompleted: false,
                        businessType: vertical,
                    }
                });
            }

            if (referredById) {
                await tx.affiliate.update({
                    where: { userId: referredById },
                    data: { referralsCount: { increment: 1 } }
                });
            }
        }, {
            maxWait: 15000,
            timeout: 30000
        });

        const redirectPath = "/onboarding/plans";

        // After successful registration, log them in
        try {
            const { cookies } = await import("next/headers");
            const cookieStore = await cookies();
            cookieStore.delete("referral_code");
        } catch (e) {}

        await signIn("credentials", {
            email,
            password,
            redirectTo: redirectPath
        });

    } catch (error) {
        if (error instanceof AuthError) {
            return { error: error.cause?.err?.message || "Invalid credentials" };
        }
        if (
            error instanceof Error && 
            (error.message === "NEXT_REDIRECT" || error.message.includes("NEXT_REDIRECT") || (error as any).digest?.startsWith("NEXT_REDIRECT"))
        ) {
            throw error;
        }
        
        console.error("Registration error:", error);
        return { error: "Something went wrong" };
    }
}

export async function login(prevState: any, formData: FormData) {
    const email = (formData.get("email") as string || "").trim().toLowerCase();
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Missing required fields" };
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        const destination = (user?.role === "admin" || user?.role === "support_admin")
            ? "/admin/dashboard"
            : "/overview";

        await signIn("credentials", {
            email,
            password,
            redirectTo: destination
        });
    } catch (error) {
        if (error instanceof AuthError) {
            console.error("NextAuth AuthError:", error.type, error.cause?.err?.message);
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials" };
                default:
                    return { error: `Authentication error: ${error.type}` };
            }
        }
        if (
            error instanceof Error && 
            (error.message === "NEXT_REDIRECT" || error.message.includes("NEXT_REDIRECT") || (error as any).digest?.startsWith("NEXT_REDIRECT"))
        ) {
            throw error;
        }
        
        console.error("Login error:", error);
        return { error: "Something went wrong" };
    }
}
