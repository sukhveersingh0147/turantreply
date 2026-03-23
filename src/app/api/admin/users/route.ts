import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth();

        // Ensure only admins can access this data
        if (session?.user?.role !== "admin" && session?.user?.role !== "support_admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const users = await prisma.user.findMany({
            include: {
                business: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("[ADMIN_GET_USERS_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
