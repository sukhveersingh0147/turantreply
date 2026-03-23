"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function submitInquiry(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const companyName = formData.get("companyName") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    if (!name || !email || !subject || !message) {
        return { error: "Please fill all required fields." };
    }

    try {
        await prisma.inquiry.create({
            data: {
                name,
                email,
                companyName,
                subject,
                message,
            },
        });

        // In a real app, you would send an email here using Resend/SMTP
        console.log(`New Inquiry from ${name} (${email}): ${subject}`);
        console.log(`To: rs163592@gmail.com`);

        revalidatePath("/contact");
        return { success: true };
    } catch (error) {
        console.error("Inquiry Error:", error);
        return { error: "Something went wrong. Please try again later." };
    }
}

export async function getInquiries() {
    const session = await auth();
    if (session?.user?.role !== "admin" && session?.user?.role !== "support_admin") {
        throw new Error("Unauthorized");
    }

    try {
        return await prisma.inquiry.findMany({
            orderBy: { createdAt: "desc" },
        });
    } catch (error) {
        console.error("Get Inquiries Error:", error);
        return [];
    }
}

export async function deleteInquiry(id: string) {
    const session = await auth();
    if (session?.user?.role !== "admin" && session?.user?.role !== "support_admin") {
        throw new Error("Unauthorized");
    }

    try {
        await prisma.inquiry.delete({
            where: { id },
        });
        revalidatePath("/inquiries");
        return { success: true };
    } catch (error) {
        console.error("Delete Inquiry Error:", error);
        return { error: "Failed to delete inquiry" };
    }
}
